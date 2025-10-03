// hooks/useFooter.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FooterItem {
  name: string;
  logo: string;
  url: string;
}

export interface FooterSection {
  id: string;
  title: string;
  type: string;
  items: FooterItem[];
  sort_order: number;
  is_active: boolean;
}

export const useFooter = () => {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFooterSections = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Parse JSON items
      const parsedSections = data?.map(section => ({
        ...section,
        items: typeof section.items === 'string' ? JSON.parse(section.items) : section.items
      })) || [];

      setSections(parsedSections);
    } catch (error) {
      console.error('Error fetching footer sections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterSections();

    // Realtime subscription
    const subscription = supabase
      .channel('footer-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'footer_sections'
        },
        () => {
          fetchFooterSections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { sections, loading, refetch: fetchFooterSections };
};