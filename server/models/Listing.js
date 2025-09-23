const { supabase } = require('../config/database');

class Listing {
  static async create(listingData) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([{
          ...listingData,
          created_at: new Date().toISOString()
        }])
        .select(`
          *,
          users:user_id (
            id,
            full_name,
            avatar_url,
            location
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filters = {}) {
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          users:user_id (
            id,
            full_name,
            avatar_url,
            location
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          users:user_id (
            id,
            full_name,
            avatar_url,
            location,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updates, userId) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getFeatured(limit = 6) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          users:user_id (
            id,
            full_name,
            avatar_url,
            location
          )
        `)
        .eq('status', 'active')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Listing;