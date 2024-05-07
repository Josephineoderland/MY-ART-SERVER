import { Schema, model } from "mongoose"

const drawingDetailsSchema = new Schema({
  hair: {
    length: [String],
    type: [String],
    color: [String],
    texture: [String],
    style: [String],
    accessories: [String],
  },
  faceShape: {
    shape: [String],
    chin: [String],
    cheekbones: [String],
    forehead: [String],
    jawline: [String],
  },
  nose: {
    width: [String],
    length: [String],
    shape: [String],
    nostrils: [String],
  },
  eyes: {
    shape: [String],
    eyelids: [String],
    eyelashes: [String],
  },
  mouth: {
    width: [String],
    lipShape: [String],
    expression: [String],
    naturalShape: [String],
    corners: [String],
  },
  posture: {
    bodyPosition: [String],
    shoulders: [String],
    headAngle: [String],
  },
  clothing: {
    style: [String],
    colors: [String],
    patterns: [String],
    accessories: [String],
  },
  physicalFeatures: {
    freckles: [String],
    wrinkles: [String],
  },
  age: {
    howOld: [String],
  },
})

const DrawingDetail = model("DrawingDetail", drawingDetailsSchema)

DrawingDetail.find({}, (err, data) => {
  if (err) {
    console.error(err)
  } else {
    console.log(data)
  }
})
