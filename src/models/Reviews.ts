import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
 reviewer: {
    type: {
      type: String,
      enum: ['retailer', 'productionUnit'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
 },
 reviewee: {
    type: {
      type: String,
      enum: ['retailer', 'productionUnit'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
 },
 rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10
 },
 review: {
    type: String,
    
 },
 
},{timestamps:true});

const reviews = mongoose.model('Review',ReviewSchema)

export default reviews;
