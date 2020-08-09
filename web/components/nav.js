import Link from 'next/link'

export default function Nav() {
  return (
    <nav>
      <ul className="flex justify-between items-center py-8">
        <li>
          <Link href="/">
            <a className="">Zoomer</a>
          </Link>
        </li>
        <ul className="flex justify-between items-center space-x-4">
          <li>
            <a href={'href'} className="">
              Discord
            </a>
          </li>
          <li>
            <a href={'href'} className="bg-white text-black p-2">
              Sign up
            </a>
          </li>
        </ul>
      </ul>
    </nav>
  )
}
