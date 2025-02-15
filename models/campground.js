const mongoose = require("mongoose"); //Mongoose simplifies the process of working with MongoDB by providing a higher-level abstraction and adding useful features like schema definition, data validation, middleware support, and query building. It improves productivity, reduces code repetition, and makes it easier to work with the data stored in MongoDB.
const Review = require("./review");
const User = require("./user");
const Schema = mongoose.Schema;

//https://res.cloudinary.com/dxvtvpuof/image/upload/https://res.cloudinary.com/dxvtvpuof/image/upload/c_scale,h_304,w_217/v1665336165/recipes/turtles.jpg
const ImageSchema = new Schema({
  url: String,
  filename: String,
});

const opts = { toJSON: { virtuals: true } };
//this is to include popup properties into the features of campground

ImageSchema.virtual("thumbnail").get(function () {
  // console.log(this);
  // console.log(this.url);
  return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="campgrounds/${this._id}" >${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
