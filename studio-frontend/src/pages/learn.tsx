import Header from "@/components/Header"
import heroImage from '../../public/learn-hero.png'
import defaultImage from "../../public/banner.png"
import Image, { StaticImageData } from "next/image"
import mediumCoinImage from "../../public/medium-coin.png"
import mediumNftImage from "../../public/medium-nft.png"
import mediumTimeImage from "../../public/medium-time.png"
import mediumMovestudioImage from "../../public/medium-movestudio.png"

const posts = [
  {
    title: "Move Studio — The Remix IDE 2.0 for the Sui blockchain", 
    description: "Learn how to use the Move Studio IDE", 
    url: "https://medium.com/@movestudio/move-studio-the-remix-ide-2-0-for-the-sui-blockchain-b5988b4050c9",
    badges: ['move studio'],
    image: mediumMovestudioImage
  },
  {
    title: "Creating your own coin on the Sui blockchain", 
    description: "Learn how to create your own coin on the Sui blockchain", 
    url: "https://movestudio.medium.com/creating-your-own-coin-on-the-sui-blockchain-f753945e218e",
    badges: ['coin', 'sui move'],
    image: mediumCoinImage
  },
  {
    title: "Minting your own NFT collection on the Sui blockchain", 
    description: "Learn how to mint your own NFT collection on the Sui blockchain",
    url: "https://medium.com/@movestudio/minting-your-own-nft-collection-on-the-sui-blockchain-46ccc59ef145",
    badges: ['nft', 'sui move'],
    image: mediumNftImage
  },
  {
    title: "Using time in your Sui smart contracts",
    description: "Learn how to use time in your Sui smart contracts",
    url: "https://medium.com/@movestudio/using-time-in-your-sui-smart-contracts-ce35af4149e4",
    badges: ['time', 'sui move'],
    image: mediumTimeImage
  },
] as {
  title: string
  description: string
  url: string
  image?: StaticImageData
  badges?: string[]
}[]

export default function Learn() {

  // Create a card for each post
  const postDisplays = posts.map((post) => {
    return (
      <div className="card max-w-xs card-compact bg-base-300 shadow-xl">
        <figure><Image src={post.image || defaultImage} alt="articleImage" className="max-w-xs"/></figure>
        <div className="card-body">
          <h2 className="card-title">
            {post.title}
          </h2>
          <p>{post.description}</p>
          <div className="card-actions justify-end">
            <button className="btn btn-secondary btn-sm"><a target="_blank" href={post.url}>Visit</a></button>
          </div>
          {/* <div className="card-actions justify-end">
            {
              post.badges?.map((badge) => {
                return (
                  <div className="badge badge-outline">{badge}</div>
                )
              })
            }
          </div> */}
        </div>
      </div>
    )
  })
    

  return (
    <div className="h-full bg-base-100">
      <Header />
      <div className="hero mb-4">
        <div className="hero-content flex-col lg:flex-row">
          <Image src={heroImage} alt="hero image" className="max-w-sm rounded-lg shadow-2xl" />
          <div>
            <h1 className="text-5xl font-bold">Educational resources</h1>
            <p className="py-6">Move Studio's directory of valuable educational resources for Sui development! Contact the Move Studio to submit or suggest additional resources!</p>
          </div>
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-4 justify-center content-center">
        {postDisplays}
      </div>
    </div>
  )
}


