import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Building, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import emailjs from '@emailjs/browser';

const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_d93facs', // Your Service ID
  TEMPLATE_ID: 'template_b2pe15z', // Your Template ID
  PUBLIC_KEY: 'jychoNk4iOoQWQTeu' // Your Public Key
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // Kirim email menggunakan EmailJS
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          from_phone: formData.phone || 'Tidak diisi',
          subject: formData.subject,
          message: formData.message,
          to_email: 'info@buysini.com',
          to_name: 'Buysini Team',
          reply_to: formData.email,
          timestamp: new Date().toLocaleString('id-ID')
        }
      );

      console.log('✅ Email sent successfully:', result);
      
      setSubmitStatus('success');
      setSubmitMessage('Pesan Anda telah terkirim! Kami akan menghubungi Anda dalam 1x24 jam.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      // Reset status setelah 5 detik
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);

    } catch (error) {
      console.error('❌ Error sending email:', error);
      setSubmitStatus('error');
      setSubmitMessage('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi atau hubungi kami langsung melalui telepon.');
      
      // Reset error status setelah 5 detik
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Alamat Kantor',
      content: 'Jl. H.Ali Kampung Tengah',
      subcontent: 'Jakarta Timur, DKI Jakarta 13530'
    },
    {
      icon: Phone,
      title: 'Telepon',
      content: '+62 878-1889-4504',
      subcontent: 'Senin - Sabtu, 08:00 - 17:00 WIB'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@buysini.com',
      subcontent: 'support@buysini.com'
    },
    {
      icon: Clock,
      title: 'Jam Operasional',
      content: 'Senin - Sabtu: 08:00 - 17:00',
      subcontent: 'Minggu & Hari Libur: Tutup'
    }
  ];

  const departments = [
    { name: 'Penjualan', email: 'sales@buysini.com', phone: '+62 878-1889-4501' },
    { name: 'Customer Service', email: 'cs@buysini.com', phone: '+62 878-1889-4502' },
    { name: 'Kemitraan', email: 'partnership@buysini.com', phone: '+62 878-1889-4503' },
    { name: 'Media & PR', email: 'media@buysini.com', phone: '+62 878-1889-4504' }
  ];

  const faqs = [
    {
      q: 'Berapa lama waktu respons customer service?',
      a: 'Tim customer service kami merespons dalam 1x24 jam pada hari kerja. Untuk pertanyaan mendesak, hubungi hotline kami.'
    },
    {
      q: 'Apakah bisa mengunjungi kantor langsung?',
      a: 'Ya, kantor kami buka Senin-Sabtu pukul 08:00-17:00 WIB. Sebaiknya membuat janji terlebih dahulu untuk kunjungan.'
    },
    {
      q: 'Bagaimana cara menjadi mitra bisnis?',
      a: 'Hubungi departemen kemitraan kami di partnership@buysini.com untuk informasi lebih lanjut tentang program mitra.'
    },
    {
      q: 'Apakah tersedia layanan konsultasi bisnis?',
      a: 'Ya, kami menyediakan konsultasi gratis untuk membantu Anda memilih produk yang tepat untuk bisnis Anda.'
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop")',
            }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
          </div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-soft-light filter blur-3xl animate-blob"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-cyan-500/20 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Hubungi Kami
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in-up animation-delay-200 leading-relaxed">
                  Tim kami siap membantu Anda dengan segala pertanyaan dan kebutuhan bisnis Anda
                </p>
                <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-400">
                  <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30">
                    <span className="font-semibold text-white">Respons Cepat</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30">
                    <span className="font-semibold text-white">Support 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16 relative -mt-10 z-10">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/15 group"
                  >
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{info.title}</h3>
                    <p className="text-white font-semibold mb-1">{info.content}</p>
                    <p className="text-white/80 text-sm">{info.subcontent}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-white/10 backdrop-blur-md p-8 md:p-10 rounded-2xl border border-white/20 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="w-8 h-8 text-white" />
                    <h2 className="text-3xl font-bold text-white">Kirim Pesan</h2>
                  </div>
                  <p className="text-white/80 mb-8">
                    Isi formulir di bawah ini dan tim kami akan merespons dalam 1x24 jam
                  </p>

                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-400 rounded-xl text-green-100 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      {submitMessage}
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-400 rounded-xl text-red-100 flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">!</span>
                      </div>
                      {submitMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all placeholder-white/50"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all placeholder-white/50"
                          placeholder="email@contoh.com"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Nomor Telepon
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all placeholder-white/50"
                          placeholder="+62 xxx-xxxx-xxxx"
                        />
                      </div>
                    </div>

                    <div>
  <label className="block text-white font-semibold mb-2">
    Subjek *
  </label>
  <div className="relative">
    <select
      name="subject"
      value={formData.subject}
      onChange={handleChange}
      required
      className="w-full px-4 py-3 bg-gray-900/90 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all appearance-none pr-10 cursor-pointer backdrop-blur-md"
    >
      <option value="">Pilih Subjek</option>
      <option value="Pertanyaan Penjualan">Pertanyaan Penjualan</option>
      <option value="Dukungan Teknis">Dukungan Teknis</option>
      <option value="Kemitraan">Kemitraan</option>
      <option value="Kritik & Saran">Kritik & Saran</option>
      <option value="Lainnya">Lainnya</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
</div>
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Pesan *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        required
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all resize-none placeholder-white/50"
                        placeholder="Tuliskan pesan Anda di sini..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-2xl hover:-translate-y-1 border border-white/20"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Kirim Pesan
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Additional Info */}
                <div className="space-y-8">
                  {/* Departments */}
                  <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <Building className="w-8 h-8 text-white" />
                      <h3 className="text-2xl font-bold text-white">Departemen</h3>
                    </div>
                    <div className="space-y-4">
                      {departments.map((dept, index) => (
                        <div 
                          key={index}
                          className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:-translate-y-1"
                        >
                          <h4 className="text-white font-bold mb-2">{dept.name}</h4>
                          <div className="space-y-2 text-sm">
                            <p className="text-white/80 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {dept.email}
                            </p>
                            <p className="text-white/80 flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {dept.phone}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Google Maps */}
                  <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-6 h-6" />
                      Lokasi Kantor
                    </h3>
                    <div className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-white/20">
                      <div className="aspect-video">
                        <iframe 
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.205841137591!2d106.86395877441092!3d-6.292335861585685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f2874a6d66db%3A0x66310acb50a197d2!2sKost%20Bu%20Nurul!5e1!3m2!1sid!2sid!4v1759519093383!5m2!1sid!2sid" 
                          width="100%" 
                          height="100%" 
                          style={{ border: 0, minHeight: '300px' }}
                          allowFullScreen 
                          loading="lazy" 
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Lokasi Kantor Buysini"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-white font-semibold">Jl. H.Ali Kampung Tengah</p>
                        <p className="text-white/80 text-sm">Jakarta Timur, DKI Jakarta 13530</p>
                        <a 
                          href="https://maps.google.com/?q=Jl.+H.Ali+Kampung+Tengah,+Jakarta+Timur"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-2 text-blue-300 hover:text-blue-200 transition-colors text-sm"
                        >
                          <MapPin className="w-4 h-4" />
                          Buka di Google Maps
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Pertanyaan Umum</h2>
                <p className="text-white/80 text-lg">Temukan jawaban cepat untuk pertanyaan yang sering diajukan</p>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                    >
                      <span className="font-bold text-white text-lg">{faq.q}</span>
                      {openFaqIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-white" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white" />
                      )}
                    </button>
                    {openFaqIndex === index && (
                      <div className="px-6 pb-6">
                        <div className="border-t border-white/20 pt-4">
                          <p className="text-white/80 leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl">
              <h2 className="text-4xl font-bold text-white mb-6">Butuh Bantuan Cepat?</h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Hubungi kami langsung melalui telepon untuk konsultasi yang lebih personal dan respons yang lebih cepat
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="tel:+6287818894504" 
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-2xl hover:-translate-y-1 border border-white/20 flex items-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Hubungi Sekarang
                </a>
                <a 
                  href="mailto:info@buysini.com" 
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-2xl hover:shadow-2xl flex items-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Email Kami
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
};

export default Contact;