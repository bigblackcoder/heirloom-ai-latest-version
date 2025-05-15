#!/usr/bin/env python3

try:
    from deepface import DeepFace
    print('DeepFace available!')
except ImportError:
    print('DeepFace not available - will use fallback methods')