import timer
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import os
import bs4
import cv2
import math
import numpy as np
from datetime import datetime

def GpsFetch(sourcePath, targetPath, gpsTarget):
    t = timer.Timer()
    t.start()

    dateAndTime = str(datetime.now())[0:19]
    dateAndTime = dateAndTime.replace(":", ".")
    
    if(int(dateAndTime[10:13]) > 11):
        dateAndTime = dateAndTime + " PM"
    else:
        dateAndTime = dateAndTime + " AM"

    newFolder = targetPath + "/" + dateAndTime
    os.mkdir(newFolder)

    os.mkdir(newFolder + "/Unmarked_Images")
    os.mkdir(newFolder + "/Marked_Images")

    for i in range(0, len(sourcePath)):
        path = sourcePath[i]
        xmp = getXMP(path)
        if xmp is None:
            print('ignoring ' + sourcePath[i])
        else:
            pixels = findPixel(xmp, gpsTarget)
            if pixels is not None:
                print('GPS intersecting ' + sourcePath[i])
                originalImage = cv2.imread(path)
                saveImage(originalImage, sourcePath[i], newFolder+"/Unmarked_Images", "Unmarked")
                image = drawCircle(sourcePath[i], pixels)
                saveImage(image, sourcePath[i], newFolder+"/Marked_Images", "Marked")
                
            else:
                print('GPS not intersecting ' + sourcePath[i])
    t.stop()
    return t.get_time()

def getXMP(path):
    # XMP
    fd = open(path, 'rb')
    d = fd.read()
    xmp_start = d.find(b'<x:xmpmeta')
    xmp_end = d.find(b'</x:xmpmeta')
    xmp_str = d[xmp_start:xmp_end + 12]
    soup = bs4.BeautifulSoup(xmp_str.decode(), 'html.parser')
    rdf = soup.find('rdf:description')
    # extracts Exif data from picture
    image = Image.open(path)
    xdimension, ydimension = image.size
    try:
        exif_data = {}
        info = image._getexif()
        if info:
            for tag, value in info.items():
                decoded = TAGS.get(tag, tag)
                if decoded == "GPSInfo":
                    gps_data = {}
                    for t in value:
                        sub_decoded = GPSTAGS.get(t, t)
                        gps_data[sub_decoded] = value[t]
                    exif_data[decoded] = gps_data
                else:
                    exif_data[decoded] = value
        if (exif_data):
            latitude, longitude = get_lat_lng(exif_data)
        print('Got lat/lon from exif')
    except Exception:
        latitude = float(rdf['drone-dji:gpslatitude'])
        try:  # thank you DJI for the typo...
            longitude = float(rdf['drone-dji:gpslongitude'])
        except Exception:
            longitude = float(rdf['drone-dji:gpslongtitude'])
        print('got lat/lon from XMP')
    if latitude == None or longitude == None:
        print('Could not get lat/lng from exif nor XMP')
    try:
        altitude = float(rdf['drone-dji:relativealtitude'])
        heading = float(rdf['drone-dji:gimbalyawdegree'])
        pitch = float(rdf['drone-dji:gimbalpitchdegree'])
        print("XMP found for " + path)
        resultDict = {
            "xdimension": xdimension,
            "ydimension": ydimension,
            "altitude": altitude,
            "latitude": latitude,
            "longitude": longitude,
            "heading": heading,
            "pitch": pitch
        }
        return resultDict
    except AttributeError as e:
        print(e)
        print("No XMP data found for " + path)
        return

def findPixel(xmp, gpsTarget):
    # will check if gpsTarget is in the picture (with XMP)
    # If it is found, returns (x, y) in pixels to draw to the picture
    # else, returns None
    # https://www.movable-type.co.uk/scripts/latlong.html
    radius = 6371000  # earth radius

    # distance (in m)
    lat1 = math.radians(xmp['latitude'])
    lat2 = math.radians(gpsTarget['latitude'])
    dlat = math.radians(gpsTarget['latitude'] - xmp['latitude'])
    dlon = math.radians(gpsTarget['longitude'] - xmp['longitude'])
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = radius * c

    if distance < 1000:  # otherwise, too far

        # bearing (in rad)
        y = math.sin(dlon) * math.cos(lat2)
        x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
        bearing = math.atan2(y, x)
        relBearing = unWrap(bearing - math.radians(xmp['heading']))

        camVector = np.array([[0], [abs(xmp['altitude'] / math.tan(math.radians(xmp['pitch'])))], [-xmp['altitude']]])
        tgtVector = np.array([[distance * math.sin(relBearing)], [distance * math.cos(relBearing)], [-xmp['altitude']]])

        cos = math.cos(math.radians(xmp['pitch']))
        sin = math.sin(math.radians(xmp['pitch']))

        rotationMatrix = np.array([[1, 0, 0], [0, cos, sin], [0, -sin, cos]])
        camVector = rotationMatrix.dot(camVector)
        tgtVector = rotationMatrix.dot(tgtVector)

        horAngle = math.atan2(tgtVector[0][0], tgtVector[1][0])
        vertAngle = math.atan2(tgtVector[2][0], tgtVector[1][0])

        fov = math.radians(gpsTarget['fov'])
        xdimension = xmp['xdimension']
        ydimension = xmp['ydimension']
        ratio = xdimension / ydimension
        vFov = 2 * math.atan2(math.tan(fov / 2), math.sqrt(1 + ratio**2))
        hFov = 2 * math.atan2(ratio * math.tan(fov / 2), math.sqrt(1 + ratio**2))

        hRatio = horAngle / (hFov / 2)
        vRatio = vertAngle / (vFov / 2)

        if abs(hRatio) < 1 and abs(vRatio) < 1:
            xPixel = int((xdimension / 2) * (1 + hRatio))
            yPixel = int((ydimension / 2) * (1 - vRatio))
            return([xPixel, yPixel])
        return
    return

def drawCircle(path, pixels):
    # returns image with circle at the specified position
    image = cv2.imread(path)
    dimensions = image.shape
    radius = dimensions[1] // 50  # width // 20
    center = (pixels[0], pixels[1])
    # image = cv2.circle(image, center, radius, (0, 0, 255), -1)
    image = cv2.circle(image, center, radius, (0, 0, 255), 20)
    return image

def saveImage(image, sourcePath, targetPath, imageType):
    # saves image at the specified path (with modified name)
    if imageType == "Unmarked":
        pathSplit = os.path.split(sourcePath)
        filePath = os.path.join(targetPath, 'original-' + pathSplit[len(pathSplit) - 1])
        cv2.imwrite(filePath, image)
    elif imageType == "Marked":
        pathSplit = os.path.split(sourcePath)
        filePath = os.path.join(targetPath, 'intersect-' + pathSplit[len(pathSplit) - 1])
        cv2.imwrite(filePath, image)
    return

def unWrap(hdg):
    while hdg > math.pi:
        hdg -= 2 * math.pi
    while hdg < -math.pi:
        hdg += 2 * math.pi
    return hdg

############# Helper functions #####################

def get_lat_lng(exif_data):
    lat = None
    lng = None
    if "GPSInfo" in exif_data:      
        gps_info = exif_data["GPSInfo"]
        gps_latitude = get_if_exist(gps_info, "GPSLatitude")
        gps_latitude_ref = get_if_exist(gps_info, 'GPSLatitudeRef')
        gps_longitude = get_if_exist(gps_info, 'GPSLongitude')
        gps_longitude_ref = get_if_exist(gps_info, 'GPSLongitudeRef')
        if gps_latitude and gps_latitude_ref and gps_longitude and gps_longitude_ref:
            lat = convert_to_degress(gps_latitude)
            if gps_latitude_ref != "N":                     
                lat = 0 - lat
            lng = convert_to_degress(gps_longitude)
            if gps_longitude_ref != "E":
                lng = 0 - lng
    return lat, lng

def get_if_exist(data, key):
    if key in data:
        return data[key]
    return None

def convert_to_degress(value):
    d0 = value[0][0]
    d1 = value[0][1]
    d = float(d0) / float(d1)

    m0 = value[1][0]
    m1 = value[1][1]
    m = float(m0) / float(m1)

    s0 = value[2][0]
    s1 = value[2][1]
    s = float(s0) / float(s1)

    return d + (m / 60.0) + (s / 3600.0)
