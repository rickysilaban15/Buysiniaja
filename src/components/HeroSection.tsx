import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import heroBackground1 from "/slidebanner1.png";
import heroBackground2 from "/slidebanner2.png";
import heroBackground3 from "/slidebanner3.png";

const HeroSection = () => {
  const slides = [
    {
      image: heroBackground1,
      title: "Promo Spesial Oktober",
      subtitle: "Diskon hingga 50% untuk produk pilihan!",
      cta: "/products"
    },
    {
      image: heroBackground2,
      title: "Produk Grosir Terbaru",
      subtitle: "Lengkapi bisnis Anda dengan koleksi terbaru.",
      cta: "/category"
    },
    {
      image: heroBackground3,
      title: "Belanja Mudah & Aman",
      subtitle: "Pengiriman cepat, kualitas terjamin.",
      cta: "/products"
    }
  ];

  return (
    <section className="relative min-h-[80vh]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000 }}
        loop={true}
        className="h-[80vh]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="w-full h-full bg-cover bg-center relative flex items-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="relative z-10 container mx-auto px-6 text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl mb-6 max-w-xl">
                  {slide.subtitle}
                </p>
                <Link to={slide.cta}>
                  <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500 group">
                    Belanja Sekarang
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSection;
