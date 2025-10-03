// pages/ShippingPolicy.tsx
import { Link } from "react-router-dom";
import { Truck, Clock, MapPin, Package, CheckCircle } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ShippingPolicy = () => {
  const lastUpdated = "1 Desember 2024";

  const shippingPartners = [
    { name: "JNE", delivery: "1-7 hari", coverage: "Seluruh Indonesia" },
    { name: "TIKI", delivery: "1-5 hari", coverage: "Jawa & Sumatera" },
    { name: "Pos Indonesia", delivery: "2-10 hari", coverage: "Seluruh Indonesia" },
    { name: "J&T", delivery: "1-4 hari", coverage: "Jawa, Bali, Sumatera" },
    { name: "SiCepat", delivery: "1-3 hari", coverage: "Jawa & Bali" },
    { name: "Ninja Express", delivery: "1-4 hari", coverage: "Jabodetabek & Jawa" }
  ];

  const shippingAreas = [
    {
      region: "Jabodetabek",
      estimate: "1-2 hari",
      cost: "Rp 8.000 - Rp 15.000",
      notes: "Gratis ongkir untuk order di atas Rp 500.000"
    },
    {
      region: "Pulau Jawa",
      estimate: "2-3 hari",
      cost: "Rp 12.000 - Rp 25.000",
      notes: "Gratis ongkir untuk order di atas Rp 750.000"
    },
    {
      region: "Sumatera & Bali",
      estimate: "3-5 hari",
      cost: "Rp 18.000 - Rp 35.000",
      notes: "Gratis ongkir untuk order di atas Rp 1.000.000"
    },
    {
      region: "Kalimantan, Sulawesi, Papua",
      estimate: "4-7 hari",
      cost: "Rp 25.000 - Rp 50.000",
      notes: "Gratis ongkir untuk order di atas Rp 1.500.000"
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Pemesanan",
      description: "Pesanan diproses setelah pembayaran dikonfirmasi",
      time: "1-6 jam",
      icon: Package
    },
    {
      step: 2,
      title: "Pengepakan",
      description: "Produk diperiksa dan dikemas dengan aman",
      time: "1-3 jam",
      icon: Package
    },
    {
      step: 3,
      title: "Penyerahan ke Ekspedisi",
      description: "Paket diserahkan ke kurir ekspedisi",
      time: "1x24 jam",
      icon: Truck
    },
    {
      step: 4,
      title: "Pengiriman",
      description: "Paket dalam perjalanan ke alamat tujuan",
      time: "1-7 hari",
      icon: MapPin
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Truck className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Kebijakan Pengiriman</h1>
            <p className="text-lg text-gray-600">
              Terakhir diperbarui: {lastUpdated}
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="prose prose-blue max-w-none text-center">
              <p className="text-lg text-gray-700">
                Kami berkomitmen untuk mengirimkan pesanan Anda dengan cepat dan aman. Kebijakan pengiriman ini menjelaskan proses, waktu, dan biaya pengiriman yang berlaku.
              </p>
            </div>
          </div>

          {/* Shipping Process */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-center mb-8">Proses Pengiriman</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {step.step}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                    <Clock className="w-3 h-3" />
                    <span>{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Partners */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-center mb-8">Partner Pengiriman</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shippingPartners.map((partner, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{partner.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{partner.delivery}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{partner.coverage}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Costs & Estimates */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-center mb-8">Estimasi Biaya & Waktu</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 font-semibold">Wilayah</th>
                    <th className="text-left py-4 font-semibold">Estimasi Waktu</th>
                    <th className="text-left py-4 font-semibold">Biaya Pengiriman</th>
                    <th className="text-left py-4 font-semibold">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingAreas.map((area, index) => (
                    <tr key={index} className="border-b border-gray-200 last:border-b-0">
                      <td className="py-4 font-medium">{area.region}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          {area.estimate}
                        </div>
                      </td>
                      <td className="py-4">{area.cost}</td>
                      <td className="py-4 text-sm text-gray-600">{area.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Important Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Yang Perlu Diperhatikan
              </h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>• Periksa alamat pengiriman sebelum checkout</li>
                <li>• Pastikan nomor HP aktif untuk koordinasi kurir</li>
                <li>• Waktu pengiriman tidak termasuk akhir pekan & libur nasional</li>
                <li>• Biaya pengiriman dapat berubah tanpa pemberitahuan</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Tips Pengiriman
              </h3>
              <ul className="space-y-2 text-green-800 text-sm">
                <li>• Gunakan alamat lengkap dengan kode pos</li>
                <li>• Siapkan uang tunai untuk pembayaran COD (jika tersedia)</li>
                <li>• Lacak pesanan secara berkala melalui website</li>
                <li>• Hubungi customer service jika ada kendala</li>
              </ul>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-4">Pertanyaan tentang Pengiriman?</h2>
              <p className="text-gray-600 mb-6">
                Tim customer service kami siap membantu Anda
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://wa.me/6287818894504" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  WhatsApp Sekarang
                </a>
                <Link 
                  to="/track-order" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lacak Pesanan
                </Link>
                <Link 
                  to="/contact" 
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Kontak Lainnya
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingPolicy;