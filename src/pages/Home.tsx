import Comment from "@/components/Comment";
import Navbar from "@/components/Navbar";

const Home = () => {
  return (
    <div className="">
      <Navbar />
      <div className="mx-auto max-w-5xl px-2 lg:px-0 mt-24">
        <Comment />
      </div>
    </div>
  );
};

export default Home;
