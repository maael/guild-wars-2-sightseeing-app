import * as React from 'react'
import { FaBeer, FaGithub, FaLink, FaReddit } from 'react-icons/fa'
import Header from '~/components/primitives/Header'

export default function Index({ fathom }) {
  return (
    <>
      <Header fathom={fathom} />
      <div>
        <div className="w-full md:w-2/3 relative aspect-video mx-auto shadow-[0_3px_40px_5px_rgba(0,0,0,0.3)] shadow-gray-500 -mt-8 md:-mt-2">
          <video src="/videos/sightseeing-example.mp4" controls muted autoPlay />
        </div>
      </div>
      <div className="py-10 flex flex-col gap-6 justify-center items-center mx-auto text-center -mt-4 -mb-6">
        <h2 className="text-4xl font-bold">Introducing the Guild Wars 2 Sightseeing App!</h2>
        <h2 className="text-4xl font-bold">A brand new way to explore Tyria</h2>
        <p className="text-lg opacity-80 max-w-lg mt-1">
          Guild Wars 2 is a game with a fantastic world, full of secret places to find and memorable locations - with
          the Sightseeing App, try to find locations in game from pictures of these places
        </p>
        <div className="flex flex-row gap-4 justify-center items-center">
          <a
            className="button"
            href="https://github.com/maael/guild-wars-2-sightseeing-app/releases/latest/download/Guild.Wars.2.Sightseeing.exe"
          >
            Download
          </a>
        </div>
      </div>
      <SetupGuide fathom={fathom} />
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

export function SetupGuide({ fathom }: { fathom: any }) {
  return (
    <div className="mt-2 text-left max-w-2xl mx-auto px-2">
      <h1 className="text-5xl font-bold pt-2 pb-1 text-center no-underline">Setup</h1>
      <ol className="text-left flex flex-col gap-2 mt-5 list-decimal mx-5 mb-1">
        <li>
          Download the latest release from
          <a
            href="https://github.com/maael/guild-wars-2-sightseeing-app/releases/latest/download/Guild.Wars.2.Sightseeing.exe"
            className="text-white font-bold bg-brown-brushed px-2 py-1 rounded-md not-italic whitespace-nowrap mx-1"
            onClick={() => fathom.trackGoal('BI8YGHQY', 0)}
          >
            here →
          </a>
        </li>
        <li>
          Run the{' '}
          <b className="text-white font-bold bg-brown-brushed px-2 py-1 rounded-md not-italic mx-1">
            Guild.Wars.2.Sightseeing.exe
          </b>{' '}
          file in the folder
        </li>
        <li>It will show you the setup page, follow the instructions and enter a Guild Wars 2 API Key</li>
        <li>
          You should now see a list of sightseeing challenges, choose one and get exploring! It will only tick off
          locations you find for the challenge you have open in the app.
        </li>
      </ol>
    </div>
  )
}
