import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'
import { FaBeer, FaGithub, FaLink, FaReddit } from 'react-icons/fa'
import Header from '~/components/primitives/Header'

export default function Index({ fathom }) {
  return (
    <>
      <Header fathom={fathom} />
      <div>
        <div className="w-full md:w-2/3 relative aspect-video mx-auto shadow-[0_3px_40px_5px_rgba(0,0,0,0.3)] shadow-white -mt-8 md:mt-0">
          <Image src="/images/screenshot.png" className="shadow-lg" layout="fill" />
        </div>
      </div>
      <div className="py-10 flex flex-col gap-8 justify-center items-center mx-auto text-center -mt-4 -mb-6">
        <h2 className="text-4xl font-bold">Introducing the Guild Wars 2 Sightseeing App!</h2>
        <h2 className="text-4xl font-bold">A brand new way to explore Tyria</h2>
        <p className="text-lg opacity-80 max-w-md ">
          Guild Wars 2 is a game with a fantastic world, full of secret places to find and memorable locations - with
          the Sightseeing App, try to find locations in game from pictures of these places
        </p>
        <div className="flex flex-row gap-4 justify-center items-center">
          <Link href="/guide">
            <a className="button">Get Started</a>
          </Link>
          <a href="#mainfeatures" className="button bg-opacity-50">
            Learn More
          </a>
        </div>
      </div>
      <div className="flex-1"></div>
      <div>
        <div className="max-w-3xl mx-auto mt-2 text-white pt-2 pb-1 text-xs flex flex-row gap-5 justify-center items-end text-center">
          <span className="flex flex-row gap-1 justify-center items-center">
            <a href="https://mael.tech">Made by Matt Elphick</a>
            <a href="https://mael.tech">
              <FaLink />
            </a>
            <a href="https://github.com/maael">
              <FaGithub />
            </a>
            <a href="http://reddit.com/u/maael">
              <FaReddit />
            </a>
          </span>
          <span className="flex flex-row gap-1 justify-center items-center">Mael.3259 in game</span>
        </div>
        <div className="max-w-3xl mx-auto text-white pb-2 text-xs flex flex-row gap-5 justify-center items-end text-center">
          <a href="https://www.buymeacoffee.com/matte" className="flex flex-row gap-1 justify-center items-center">
            Enjoying the game? Get me a beer. <FaBeer />
          </a>
        </div>
      </div>
    </>
  )
}
