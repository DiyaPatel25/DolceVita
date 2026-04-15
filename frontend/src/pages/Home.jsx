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
      <NewsLetter />
      {/* <Testimonial /> */}
    </div>
  );
};
export default Home;
