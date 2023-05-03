import Link from 'next/link';
import dan from "../../public/dan.jpeg";
import evan from "../../public/evan.png";
import buildPage from "../../public/build.png"
import deployPage from "../../public/deploy.png"
import banner from "../../public/banner.png"
import Image from 'next/image'
import Header from "../components/Header";


const quotes = [
  "Coding, like poetry, should be short and concise",
  "It’s not a bug; it’s an undocumented feature",
  "Code is like humor. When you have to explain it, it’s bad",
  "Clean code always looks like it was written by someone who cares",
  "If, at first, you do not succeed, call it version 1.0",
  "Talk is cheap. Show me the code", 
]

function LandingPage() {

  
  return (
    <div className="overflow-x-hidden">
      <Header/>
      <div className="hero min-h-min w-full">
        <div className="hero-content flex-row">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Move Studio IDE</h1>
            <p className="py-6">An online IDE built for Sui smart contract development. Built for developers of all experience levels, Move Studio provides developers with essential building tools and resources.</p>
            <a><Link href="/build"><button className="btn btn-primary">Get building</button></Link></a>
          </div>
          <Image src={banner} alt="" className="rounded-lg shadow-2xl" width={500}/>

        </div>
      </div>
      <div className="flex justify-center m-10 ">
        <div style={{width: "70%"}}>
          <div className="carousel" >
            <div id="feature-item1" className="carousel-item w-full">
              <div className="card card-compact">
                <figure className="px-10 pt-10"><Image src={buildPage} alt="" className="w-full rounded-2xl shadow-2xl" style={{}} /></figure>
                <div className="card-body text-center items-center">
                  <h2 className="card-title">The Build Page</h2>
                  <p>The build page provides an environment to create and work on Sui Move packages. We use the monaco editor and provide Sui Move package compilation. </p>
                </div>
              </div>
            </div> 
            <div id="feature-item2" className="carousel-item w-full">
              <div className="card card-compact">
                <figure className="px-10 pt-10 "><Image src={deployPage} alt="" className="w-full rounded-2xl shadow-2xl" style={{}} /></figure>
                <div className="card-body text-center items-center">
                  <h2 className="card-title">The Deploy Page</h2>
                  <p>The deploy page provides an environment to deploy and interact with Sui Move packages and objects. We visualize the Sui objects as well as provide an interface to call Sui Move entry functions. . </p>
                </div>
              </div>            
            </div> 
          </div> 
          <div className="flex justify-center w-full py-2 gap-2">
            <a href="#feature-item1" className="btn btn-xs">1</a> 
            <a href="#feature-item2" className="btn btn-xs">2</a> 
          </div>
        </div>
      </div>
      <div className="flex justify-center  m-10">
        <div className="card card-compact w-fit" >
          <figure className="px-10 pt-10">
            <Image src={dan} alt="dan" width={250} className="rounded-2xl shadow-2xl" />
          </figure>
          <div className="card-body items-center text-center">
            <h2 className="card-title">Daniel</h2>
            <p>Cofounder & Developer</p>
          </div>
        </div>  
        <div className="card card-compact w-fit" >
          <figure className="px-10 pt-10">
            <Image src={evan} alt="Evan" width={250} className="rounded-2xl shadow-2xl" />
          </figure>
          <div className="card-body items-center text-center">
            <h2 className="card-title">Evan</h2>
            <p>Cofounder & Developer</p>
          </div>
        </div>  
      </div>
      <footer className="footer items-center align-center p-4 text-neutral-content">
        <div className="items-center">
          {quotes[Math.floor(Math.random() * quotes.length)]}
        </div> 
      </footer>
    </div>
  );
}

export default LandingPage;