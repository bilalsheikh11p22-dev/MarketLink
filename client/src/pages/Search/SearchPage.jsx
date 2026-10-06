import {
  Link,
  useSearchParams
} from 'react-router-dom'

import { useLanguage } from '../../context/LanguageContext.jsx'


export default function SearchPage() {

  const [searchParams] =
    useSearchParams()

  const { t: tr } =
    useLanguage()

  const query =
    searchParams.get('q') || ''


  return (

    <main
      className="
        min-h-screen
        bg-cream
        pt-32
        pb-20
      "
    >

      <div className="container-page">

        {/* Header */}

        <div className="mb-12">

          <p
            className="
              text-sage
              uppercase
              tracking-[0.2em]
              text-sm
              mb-3
            "
          >
            {tr('search')}
          </p>


          <h1
            className="
              font-display
              text-4xl
              md:text-6xl
              text-forest-deep
            "
          >
            {tr('search')}
          </h1>


          {query && (

            <p
              className="
                mt-4
                text-forest-deep/60
              "
            >
              Search results for:

              <span
                className="
                  font-medium
                  text-forest-deep
                  ml-2
                "
              >
                "{query}"
              </span>
            </p>

          )}

        </div>


        {/* Empty search state */}

        <section
          className="
            border
            border-forest-deep/10
            bg-cream-soft
            py-20
            px-6
            text-center
          "
        >

          <h2
            className="
              font-display
              text-2xl
              md:text-3xl
              text-forest-deep
            "
          >
            {query
              ? `Search results for "${query}"`
              : 'Start searching'
            }
          </h2>


          <p
            className="
              text-forest-deep/60
              mt-3
              max-w-xl
              mx-auto
            "
          >
            {query
              ? 'Your market, farmer and product results will appear here.'
              : tr('searchPlaceholder')
            }
          </p>


          <Link
            to="/products"
            className="
              inline-block
              mt-8
              px-7
              py-3
              bg-forest-deep
              text-cream
              hover:bg-sage
              transition-colors
              duration-300
            "
          >
            {tr('exploreProducts')}
          </Link>

        </section>

      </div>

    </main>
  )
}