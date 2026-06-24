import Categories from "../components/Categories";
import Hero from "../components/Hero";
import Menus from "../components/Menus";
import NewsLetter from "../components/NewsLetter";
import Testimonial from "../components/Testimonial";

const Home = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-color)' }}>
      <Hero />
      <Categories />
      <div className="py-12 bg-[#111827]">
        <div className="text-center mb-8 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured <span className="text-orange-500">Delights</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Discover our most loved creations, crafted to perfection and ready to make your day special.</p>
        </div>
        <Menus />
      </div>
      <NewsLetter />
      {/* <Testimonial /> */}
    </div>
  );
};
export default Home;
