import { Router } from 'express';
import {
  getAllListings,
  getListing,
  createListing,
  updateListing,
  deleteListing
} from '../controllers/listingController.js';

const router = Router();

// TODO: wire up the routes described in README.md section 3.

export default router;
