#!/usr/bin/env bash

set -e

ffmpeg \
  -y \
  -i type.mov \
  -r 15 \
  -vf "scale=-1:175,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  ../help/type.web.gif

ffmpeg \
  -y \
  -i grade.mov \
  -r 15 \
  -vf "scale=-1:316,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  ../help/grade.web.gif

convert suggestions.png -resize 50% ../help/suggestions.web.png

ffmpeg \
  -i landing.mov \
  -row-mt 1 -deadline best -c:v libvpx-vp9 -b:v 0 -crf 45 -pass 1 -an -f null \
  /dev/null

ffmpeg \
  -y \
  -i landing.mov \
  -row-mt 1 -deadline best -c:v libvpx-vp9 -b:v 0 -crf 45 -pass 2 -c:a libopus \
  ../fe/public/landing.webm
