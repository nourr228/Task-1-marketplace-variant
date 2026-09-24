import Joi from 'joi';
import { Listing } from '../models/Listing.js';

// TODO: write a validation schema for create/update per README.md section 2.
const createSchema = Joi.object({
  title: Joi.string().min(2).max(60).required(),
  description: Joi.string().optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string().valid('textbooks', 'electronics', 'furniture', 'clothing', 'other').default('other'),
  condition: Joi.string().valid('new', 'like-new', 'used', 'worn').default('used'),
  status: Joi.string().valid('active', 'sold', 'removed').default('active'),
  seller: Joi.string().hex().length(24).optional()
});

const updateSchema = Joi.object({
  title: Joi.string().min(2).max(60),
  description: Joi.string().optional(),
  price: Joi.number().min(0),
  category: Joi.string().valid('textbooks', 'electronics', 'furniture', 'clothing', 'other'),
  condition: Joi.string().valid('new', 'like-new', 'used', 'worn'),
  status: Joi.string().valid('active', 'sold', 'removed'),
  seller: Joi.string().hex().length(24)
}).unknown(false);

function publicListing(l) {
  const seller = l.seller
    ? typeof l.seller === 'object' && l.seller._id
      ? {
          id: l.seller._id.toString(),
          name: l.seller.name,
          email: l.seller.email
        }
      : { id: String(l.seller) }
    : null;

  return {
    id: l._id.toString(),
    title: l.title,
    description: l.description,
    price: l.price,
    category: l.category,
    condition: l.condition,
    status: l.status,
    seller
  };
}

// GET /api/listings
// TODO: implement per README.md section 3.
export async function getAllListings(req, res, next) {
  try {
    const includeRemoved = req.query.includeRemoved === 'true';
    const filter = includeRemoved ? {} : { status: { $ne: 'removed' } };

    const listings = await Listing.find(filter)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ listings: listings.map(publicListing) });
  } catch (err) {
    next(err);
  }
}

// GET /api/listings/:id
// TODO: implement per README.md sections 3 and 5.
export async function getListing(req, res, next) {
  try {
    const includeRemoved = req.query.includeRemoved === 'true';
    const filter = includeRemoved
      ? { _id: req.params.id }
      : { _id: req.params.id, status: { $ne: 'removed' } };

    const listing = await Listing.findOne(filter).populate('seller', 'name email');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ listing: publicListing(listing) });
  } catch (err) {
    next(err);
  }
}

// POST /api/listings
// TODO: implement per README.md section 3.
export async function createListing(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    
    const listing = await Listing.create(value);

    res.status(201).json({listing: publicListing(listing)});
  } catch (err) {
    next(err);
  }
}

// PATCH /api/listings/:id
// TODO: implement per README.md sections 3 and 5.
export async function updateListing(req, res, next) {
  try {
    // TODO
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });
    
    const doc = await Listing.findByIdAndUpdate(req.params.id, { $set: value }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Listing not found' });
    res.json({ listing: publicListing(doc) });
  } catch (err) { next(err); }
}

// PATCH /api/listings/:id/sold
export async function markListingAsSold(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status === 'removed') {
      return res.status(400).json({ message: 'Cannot mark a removed listing as sold' });
    }

    listing.status = 'sold';
    await listing.save();

    res.status(200).json({
      message: 'Listing marked as sold',
      listing: publicListing(listing)
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/listings/:id
// TODO: implement per README.md sections 4 and 5.
export async function deleteListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status === 'removed') {
      return res.status(200).json({
        message: 'Listing already removed',
        listing: publicListing(listing)
      });
    }

    listing.status = 'removed';
    await listing.save();

    res.status(200).json({
      message: 'Listing marked as removed',
      listing: publicListing(listing)
    });
  } catch (err) {
    next(err);
  }
}
