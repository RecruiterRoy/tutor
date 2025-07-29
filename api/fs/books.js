import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { grade } = req.query;
    
    // Query books from database
    let query = supabase
      .from('books')
      .select('*')
      .order('name');
    
    if (grade) {
      query = query.eq('grade', grade);
    }
    
    const { data: books, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch books from database' });
    }
    
    // If no books found in database, return empty array
    if (!books || books.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
}