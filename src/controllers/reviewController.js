"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitReview = void 0;
const Reviews_1 = __importDefault(require("../models/Reviews"));
const submitReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { reviewerId, revieweeId, rating, review } = req.body;
    const reviewerRole = req.query.reviewer;
    const revieweeRole = req.query.reviewee;
    try {
        // Check if there is an existing review by the same reviewer for the same reviewee
        const existingReview = yield Reviews_1.default.findOne({
            'reviewer.id': reviewerId,
            'reviewee.id': revieweeId
        });
        if (existingReview) {
            // Update the existing review
            existingReview.rating = rating * 2;
            existingReview.review = review;
            yield existingReview.save();
            return res.status(200).json({ success: true, message: 'Review updated successfully' });
        }
        else {
            // Create a new review
            const newReview = new Reviews_1.default({
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
            yield newReview.save();
            return res.status(200).json({ success: true, message: 'Review submitted successfully' });
        }
    }
    catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ success: false, message: 'An error occurred while submitting your review.' });
    }
});
exports.submitReview = submitReview;
