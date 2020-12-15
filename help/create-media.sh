ffmpeg \
  -i type.mov \
  -r 15 \
  -vf "scale=-1:175,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  type.web.gif

ffmpeg \
  -i grade.mov \
  -r 15 \
  -vf "scale=-1:316,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  grade.web.gif

convert suggestions.png -resize 50% suggestions.web.png
