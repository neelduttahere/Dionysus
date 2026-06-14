import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Button, Heading, Text } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'
import './LandingPage.css'

export function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <Text as="p" size="2" weight="medium" className="landing-kicker">
            Open satellite imagery workspace
          </Text>
          <Heading as="h1" size="9" className="landing-title">
            Dionysus
          </Heading>
          <Text as="p" size="5" className="landing-description">
            Compose public STAC imagery, render assets through TiTiler, and compare
            satellite scenes on an interactive map.
          </Text>
          <Button asChild size="4" highContrast>
            <Link to="/map/compose">
              Open Composer
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
