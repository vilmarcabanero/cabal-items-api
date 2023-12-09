import express from 'express'
import { addItem, autoSuggest, getItems, getRecentSearches, searchItems } from '../controller/item.controller'

const router = express.Router()

router.post('/', addItem)
router.get('/', getItems)
router.get('/search', searchItems)
router.get('/recent', getRecentSearches)
router.get('/autosuggest', autoSuggest)

export { router as itemRouter }
