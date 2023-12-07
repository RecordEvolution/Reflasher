#!/bin/bash
#-----------------------------------------------------------------------------#

# check arguments
if [ -z $1 ]; then
  echo "argument 1 missing"
  exit
fi
if [ -z $2 ]; then
  echo "argument 2 missing"
  exit
fi

# catch arguments
insvg="${1}" # source file as svg
outdi="${2}" # output directory

# check svg file
if [ -f ${insvg} ]; then
  echo "file ${insvg} exists"
else
  echo "file ${insvg} not found"
  exit
fi

# check output directory
if [ -d ${outdi} ]; then
  echo "directory ${outdi} exists"
else
  echo "directory ${outdi} not found"
  exit
fi

# procude various sizes
for i in {1..32}
do
  echo -e "${i}: "
  # find png size
  size=$((i*16))
  echo "size ${size}"
  # construct conversion command
  cmd="inkscape -z -e ${outdi}reswarm-icon-${size}x${size}.png -w ${size} -h ${size} ${insvg}"
  echo ${cmd}
  # perform conversion
  ${cmd}
done

# inkscape -z -e icons/text-x-reswarm-64-64.png -w 64 -h 64 reswarm_icon.svg

#-----------------------------------------------------------------------------#
