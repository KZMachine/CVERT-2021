#!/usr/bin/python
# import sys
# from __future__ import division

from flask import Flask, request, Response
from flask_cors import CORS

import handlePost

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
CORS(app)

@app.route('/', methods=['GET', 'POST'])
def get():
    if request.method == 'POST':
        if request.json.get('targetPath') == 'response':
            algorithm = request.json.get('algorithm')
            sourcePath = request.json.get('sourcePath')
            parameters = request.json.get('parameters')
            response = handlePost.handleFilter(algorithm, sourcePath, parameters)
        else:
            sourcePath = request.json.get('sourcePath')
            targetPath = request.json.get('targetPath')
            gpsTarget = request.json.get('gpsTarget')
            response = handlePost.handleGPSfetch(sourcePath, targetPath, gpsTarget)
    elif request.method == 'GET':
        response = Response(status=200)
    return(response)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
