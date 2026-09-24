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
  return { id: l._id.toString(), title: l.title, description: l.description, price: l.price, category: l.category, condition: l.condition, status: l.status, seller: l.seller };
}

// GET /api/listings
// TODO: implement per README.md section 3.
export async function getAllListings(req, res, next) {
  try {
    // TODO
     const listings = await Listing.find().sort({ createdAt: -1 }).lean();
     res.json({ listings: listings.map(publicListing) });
  } catch (err) { next(err); }
}

// GET /api/listings/:id
// TODO: implement per README.md sections 3 and 5.
export async function getListing(req, res, next) {
  try {
    // TODO
    const listing = await Listing.findById(req.params.id);     
    if (!listing) return res.status(404).json({ message: 'User not found' });
    res.json({ listing: publicListing(listing) });
  } catch (err) { next(err); }
}

// POST /api/listings
// TODO: implement per README.md section 3.
export async function createListing(req, res, next) {
  try {
    // TODO
    const { value, error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    
    const existing = await User.findOne({ email: value.email });
    if (existing) return res.status(409).json({ message: 'Email already used' });
    
    const password = await bcrypt.hash(value.password, 10);
    const user = await User.create({ name: value.name, email: value.email, password });
    res.status(201).json({ user: publicUser(user) });
  } catch (err) { next(err); }
}

// PATCH /api/listings/:id
// TODO: implement per README.md sections 3 and 5.
export async function updateListing(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}

// DELETE /api/listings/:id
// TODO: implement per README.md sections 4 and 5.
export async function deleteListing(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}
