const { supabase } = require('../config/database');

class Swap {
  static async create(swapData) {
    try {
      const { data, error } = await supabase
        .from('swaps')
        .insert([{
          ...swapData,
          created_at: new Date().toISOString()
        }])
        .select(`
          *,
          requester:requester_id (
            id,
            full_name,
            avatar_url
          ),
          owner:owner_id (
            id,
            full_name,
            avatar_url
          ),
          listing:listing_id (
            id,
            title,
            image_url
          )
        `)
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
        .from('swaps')
        .select(`
          *,
          requester:requester_id (
            id,
            full_name,
            avatar_url
          ),
          owner:owner_id (
            id,
            full_name,
            avatar_url
          ),
          listing:listing_id (
            id,
            title,
            image_url
          )
        `)
        .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status, userId) {
    try {
      const { data, error } = await supabase
        .from('swaps')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('swaps')
        .select(`
          *,
          requester:requester_id (
            id,
            full_name,
            avatar_url,
            phone
          ),
          owner:owner_id (
            id,
            full_name,
            avatar_url,
            phone
          ),
          listing:listing_id (
            id,
            title,
            image_url,
            description
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
}

module.exports = Swap;