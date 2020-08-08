import dynamic from 'next/dynamic'

const Bar = dynamic(() => import('../components/terminal'), {
  ssr: false,
})

const IndexPage = () => {
  return <Bar />
}

export default IndexPage
