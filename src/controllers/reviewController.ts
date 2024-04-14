import { Request, Response, query } from "express";
import reviews from "../models/Reviews";


export const submitReview = async (req: Request, res: Response) => {

    console.log(req.body);
    const { reviewerId, revieweeId, rating, review } = req.body;
    const reviewerRole = req.query.reviewer;
    const  revieweeRole = req.query.reviewee;
    try {
      // Check if there is an existing review by the same reviewer for the same reviewee
      const existingReview = await reviews.findOne({
        'reviewer.id': reviewerId,
        'reviewee.id': revieweeId
    });

    if (existingReview) {
        // Update the existing review
        existingReview.rating = rating * 2;
        existingReview.review = review;
        await existingReview.save();
        return res.status(200).json({ success: true, message: 'Review updated successfully' });
    } else {
        // Create a new review
        const newReview = new reviews({
            reviewer: {
                type: reviewerRole, // Assuming the reviewer is a retailer, adjust as necessary
                id: reviewerId,
            },
            reviewee: {
                type: revieweeRole, // Assuming the reviewee is a production unit, adjust as necessary
                id: revieweeId,
            },
            rating: rating * 2,
            review,
        });

        await newReview.save();
        return res.status(200).json({ success: true, message: 'Review submitted successfully' });
      }
       
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ success: false, message: 'An error occurred while submitting your review.' });
    }
}