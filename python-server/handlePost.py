import cv2
import numpy as np
import base64
import importlib

def handleFilter(algorithm, sourcePath, parameters):
    image = data_uri_to_cv2_img(sourcePath)
    moduleName = 'Algorithms.' + algorithm['libName']
    module = importlib.import_module(moduleName)
    resultImage = getattr(module, algorithm['pyFunction'])(image[1], parameters)
    uri = cv2_img_to_data_uri(image[0], resultImage[0])
    resultDict = {
        'image': uri,
        'time': resultImage[1],
        'precentage': resultImage[2]
    }
    return(resultDict)

def handleGPSfetch(sourcePath, targetPath, gpsTarget):
    import Algorithms.GPSfetch
    time = Algorithms.GPSfetch.GpsFetch(sourcePath, targetPath, gpsTarget)
    resultDict = {
        'sourcePath': sourcePath,
        'targetPath': targetPath,
        'gpsTarget': gpsTarget
    }
    return(resultDict)


def data_uri_to_cv2_img(uri):
    prefix = uri.split(',')[0]
    encoded_data = uri.split(',')[1]
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return ([prefix, img])


def cv2_img_to_data_uri(prefix, resultImage):
    type = '.' + prefix.replace(';', '/').split('/')[1]
    string = base64.b64encode(cv2.imencode(type, resultImage)[1]).decode()
    return(string)
