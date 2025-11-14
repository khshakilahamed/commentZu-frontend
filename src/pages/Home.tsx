import Comment from "@/components/Comment";
import Navbar from "@/components/Navbar";

const Home = () => {
      return (
            <div className="mx-auto max-w-5xl">
                  <Navbar/>
                  <div className="mt-5">
                        <Comment/>
                  </div>
            </div>
      );
};

export default Home;