import React, { useState } from 'react'
import { GetStaticProps } from 'next'
import PortableText from 'react-portable-text'
import { useForm, SubmitHandler } from 'react-hook-form'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../typings'

interface IFormInput { 
  _id: string;
  name: string;
  email: string;
  comment: string;
}

interface Props {
  post: Post
}

const Post = ({post}: Props) => {
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log(data,'pl')
    await fetch('/api/createComment', { 
      method: 'POST',
      body: JSON.stringify(data)
    }).then((data) => {
      console.log(data)
      setSubmitted(true)
    }).catch((err) => {
      console.log(err)
      setSubmitted(false)
    })
  }

  return (
    <div>
      <Header />
      <img className="w-full h-40 object-cover" src={urlFor(post.mainImage).url()!} alt={post.title} />

      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500 mb-2">{post.title}</h2>
        <div className="flex items-center space-x-2">
          <img src={urlFor(post.author.image).url()} alt={post.author.name} className="rounded-full h-10 w-10" />
          <p className="font-extralight text-sm">
            Blog post by{" "} <span>{post.author.name}</span> - Published at {" "} {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>

        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={post.body}
            serializers={{
              h1: (props: any) => {
                <h1 className="text-2xl font-bold my-5" {...props} />
              },
              h2: (props: any) => {
                <h1 className="text-xl font-bold my-5" {...props} />
              },
              li: ({ children }: any) => {
                <li className="mt-4 list-disc" {...children}></li>
              },
              link: ({ href, children }: any) => {
                <a className="text-blue-500 hover:underline">{children}</a>
              }
            }}
          />
        </div>

        <hr className="max-w-lg my-5 max-auto border border-yellow-500" />

        {submitted ? (
          <div className="flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto">
            <h1>Thank you for sub comment!</h1>
            <p>Once it has been approved, it will be appear bellow!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-5 max-w-2xl mx-auto mb-10">
            <h3 className="text-sm text-yellow-500">Enjoy this article</h3>
            <h4 className="text-3xl font-bold">Leave a comment bellow!</h4>
            <input {...register("_id")} type="hidden" name="_id" value={post._id} />
            <label className="flex flex-col mb-5">
              <span className="text-gray-700">Name</span>
              <input {...register("name", { required: true })} className="shadow border rounded py-2 px-3 form-input mt-1 block-w-full ring-yellow-500 outline-none focus:ring" type="text" placeholder="Jhon Appsaleed" />
            </label>
            <label className="flex flex-col mb-5">
              <span className="text-gray-700">Email</span>
              <input {...register("email", { required: true })} className="shadow border rounded py-2 px-3 form-input mt-1 block-w-full ring-yellow-500 outline-none focus:ring" type="email" placeholder="Jhon Appsaleed" />
            </label>
            <label className="flex flex-col mb-5">
              <span className="text-gray-700">Comment</span>
              <textarea {...register("comment", { required: true })} className="shadow border rounded py-2 px-3 form-textarea mt-1 block-w-4 ring-yellow-500 outline-none focus:ring" placeholder="Jhon Appsaleed" rows={8} />
            </label>

            <div className="flex flex-col p-5">
              {errors.name && (
                  <span className="text-red-500">The name is required</span>
              )}
              {errors.email && (
                  <span className="text-red-500">The email is required</span>
              )}
              {errors.comment && (
                  <span className="text-red-500">The comment is required</span>
              )}
            </div>
            <input type="submit" className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer" />
          </form>
        )}

        <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2">
          <h3 className="text-4xl">Comments</h3>
          <hr className="pb-2" />
          {
            post.comments.map(comment => (
              <div key={comment._id}>
                <p><span className='text-yellow-500'>{comment.name}:</span>{comment.comment}</p>
              </div>
            ))
          }
        </div>
      </article>

    </div>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `*[_type == "post"] {
    _id,
    slug {
      current
    }
  }`

  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current
    }
  }))

  return { 
    paths,
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    _createdAt,
    title,
    author -> {
      name,
      image,
    },
    'comments': *[_type == "comment" && post._ref == ^._id && approved == true],
    description,
    mainImage,
    slug,
    body,
  }`

  const post = await sanityClient.fetch(query, {slug: params?.slug})

  if(!post) {
    return { notFound: true }
  }
  
  return {
    props: {
      post
    },
    revalidate: 60
  }

}