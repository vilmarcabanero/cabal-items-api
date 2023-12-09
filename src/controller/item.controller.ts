// In one of your route files or directly in src/index.ts for testing
import { Request, Response } from 'express';
import Item from '../model/item.model';
import Search from '../model/search.model';
import mongoose from 'mongoose';

interface IItem {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  date: Date;
  details: string;
}

export async function addItem(req: Request, res: Response) {
  try {
    const newItem = new Item({
      name: req.body.name,
      price: req.body.price,
      date: req.body.date,
      details: req.body.details,
    });

    await newItem.save();
    res.status(201).send(newItem);
  } catch (error) {
    res.status(500).send(error);
  }
};

export async function getItems(req: Request, res: Response) {
  try {
    const items = await Item.find({});
    return res.send(items)
  } catch (error) {
    return res.status(500).send(error)
  }
}

export async function searchItems(req: Request, res: Response) {
  try {
    const encodedSearchTerm = req.query.q as string;
    const searchTerm = decodeURIComponent(encodedSearchTerm);
    
    // Escape special characters for the regular expression
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create a case-insensitive regular expression from the escaped search term
    const regex = new RegExp(escapedSearchTerm, 'i');

    // Find items where the name contains the search term
    const items = await Item.find({ name: { $regex: regex } });

    // Extract item IDs
    const itemIds = items.map(item => item._id);

    // Create a new search entry with these item IDs
    const newSearch = new Search({ term: searchTerm, itemIds: itemIds });
    await newSearch.save();


    // Check the total number of searches and remove the oldest if more than 20
    const searchCount = await Search.countDocuments();
    if (searchCount > 20) {
      const oldestSearches = await Search.find().sort({ createdAt: 1 }).limit(searchCount - 20);
      for (let search of oldestSearches) {
        await Search.findByIdAndDelete(search._id);
      }
    }

    return res.send(items);
  } catch (error) {
    return res.status(500).send(error);
  }
}


export async function getRecentSearches(req: Request, res: Response) {
  try {
    const recentSearches = await Search.find()
                                       .sort({ createdAt: -1 })
                                       .limit(20)
                                       .populate('itemIds');
    
    // Aggregate all items from the recent searches
    let allItems: IItem[] = recentSearches.flatMap(search => search.itemIds as unknown as IItem[]);

    // Remove duplicate items
    let uniqueItems = Array.from(new Map(allItems.map(item => [item['_id'].toString(), item])).values());

    res.json(uniqueItems);
  } catch (error) {
    res.status(500).send('Error fetching recent searches');
  }
}


export async function autoSuggest(req: Request, res: Response) {
  try {
    const searchTerm = req.query.q as string;
    const regex = new RegExp(searchTerm, 'i');

    // Fetch items matching the search term
    const items = await Item.find({ name: { $regex: regex } });

    // Create a Set to track unique item names
    const uniqueItemNames = new Set();

    // Filter out duplicates based on item name
    const uniqueItems = items.filter(item => {
      const isDuplicate = uniqueItemNames.has(item.name);
      uniqueItemNames.add(item.name);
      return !isDuplicate;
    }).slice(0, 10); // Limit the number of suggestions to 10

    res.json(uniqueItems);
  } catch (error) {
    res.status(500).send(error);
  }
}
