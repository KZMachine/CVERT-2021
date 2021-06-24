# -*- mode: python ; coding: utf-8 -*-
import os

block_cipher = None

############## Add your files here #############

imports = [
    "Algorithms.DXDetector",
    "Algorithms.RXDetector",
    "Algorithms.AODNet"
]

extraFiles = [
    "pretrained_aod_net_numpy.npy"
]

##############################################

dataFiles = []
for file in extraFiles:
    dataFiles.append((os.path.join('Algorithms', file), 'Algorithms'))

a = Analysis(['server.py'],
             pathex=[os.getcwd()],
             binaries=[],
             datas=dataFiles,
             hiddenimports=imports,
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          [],
          name='server',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          upx_exclude=[],
          runtime_tmpdir=None,
          console=True )