import { ArrowLeftIcon, ImageIcon } from '@radix-ui/react-icons'
import { Button, Heading, Text } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'
import './NotFoundPage.css'

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-content">
        <div className="not-found-mark">
          <ImageIcon />
        </div>
        <Text size="2" weight="bold" color="iris" className="not-found-kicker">
          Route not found
        </Text>
        <Heading as="h1" size="8">
          This view is outside the current workspace.
        </Heading>
        <Text as="p" size="4" color="gray" className="not-found-description">
          The shared link may be incomplete, or the route may not exist in this
          Dionysus build.
        </Text>
        <div className="not-found-actions">
          <Button asChild size="3">
            <Link to="/map/compose">
              <ImageIcon />
              Open Composer
            </Link>
          </Button>
          <Button asChild size="3" variant="surface">
            <Link to="/">
              <ArrowLeftIcon />
              Landing page
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
