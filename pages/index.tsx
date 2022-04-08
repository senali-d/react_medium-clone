import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import { sanityClient, urlFor } from '../sanity'
import { Post } from '../typings'

interface Props {
  posts: [Post]
}

const Home = (props: Props) => {
  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Medium</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <div className="flex items-center justify-center bg-yellow-400 border-y border-black py-10 lg:py-0">
        <div className="px-10 space-y-5">
          <h1 className="text-6xl max-w-xl font-serif">
            <span className="underline decoration-black decoration-4">Medium</span>
            {" "}is a place to write, read, and content
          </h1>
          <h2>It's easy and free to post your thinking on any topic and connect with millions of readers.</h2>
        </div>
        <img src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png" className="hidden md:inline-flex h-32 lg:h-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 md:p-6">
        {
          props.posts.map(post => (
            <a key={post._id} href={`/post/${post.slug.current}`}>
              <div className="border rounded-lg coursor-pointer overflow-hidden hover:scale-105 transition-transform duration-200 ease-in-out">
                <img className="w-full h-60 object-cover " src={urlFor(post.mainImage).url()!} alt={post.title} />
                <div className="bg-white p-5 flex justify-between">
                  <div>
                    <p className="text-bold text-lg">{post.title}</p>
                    <p className="text-xs">{post.description} by {post.author.name}</p>
                  </div>
                  <img className="rounded-full h-12 w-12" src={urlFor(post.author.image).url()} alt={post.author.name} />
                </div>
              </div>
            </a>
          ))
        }
      </div>
    </div>
  )
}

export default Home

export const getServerSideProps = async () => {
  const query = `*[_type == "post"] {
    _id,
    title,
    author -> {
      name,
      image,
    },
    description,
    mainImage,
    slug,
  }`

  const posts = await sanityClient.fetch(query)
  return {
    props: {
      posts,
    }
  }
}