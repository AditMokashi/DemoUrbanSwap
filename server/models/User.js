const { supabase, supabaseAdmin } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    try {
      const { email, password, full_name, location, phone } = userData;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password_hash: hashedPassword,
            full_name,
            location,
            phone,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Remove password hash from returned data
      const { password_hash, ...userWithoutPassword } = data;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, location, phone, avatar_url, points, created_at, updated_at')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(id, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('id, email, full_name, location, phone, avatar_url, points, created_at, updated_at')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePoints(userId, points) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          points: points,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('points')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;