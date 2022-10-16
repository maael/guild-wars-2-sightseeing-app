import Link from 'next/link'
import * as React from 'react'
import { FaDownload, FaGithub } from 'react-icons/fa'
import * as Fathom from 'fathom-client'
import Image from 'next/image'
import logoImage from '../../../public/logo.png'

export default function Header({ fathom }: { fathom: typeof Fathom }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 justify-between items-center pb-20">
      <Link href="/">
        <h1 className="gwfont flex flex-row justify-center items-center gap-2 bg-brown-brushed px-3 py-1 rounded-md text-2xl shadow-md cursor-pointer">
          <div className="relative h-8 aspect-square">
            <Image src={logoImage} layout="fill" />
          </div>{' '}
          GW2 Sightseeing
        </h1>
      </Link>
      <div className="flex flex-row gap-2">
        <a
          className="button"
          href="https://github.com/maael/guild-wars-2-sightseeing-app/releases/latest/download/giveaway-o-tron.zip"
          onClick={() => fathom.trackGoal('BI8YGHQY', 0)}
        >
          <FaDownload /> Download
        </a>
        <a className="button text-2xl px-4" href="https://github.com/maael/guild-wars-2-sightseeing-app">
          <FaGithub />
        </a>
      </div>
    </div>
  )
}
