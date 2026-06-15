import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons'
import {
  Button,
  Callout,
  Card,
  DataList,
  Dialog,
  Flex,
  IconButton,
  ScrollArea,
  Separator,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import './StacUrlHelpDialog.css'

export function StacUrlHelpDialog() {
  return (
    <Dialog.Root>
      <Tooltip content="STAC URL compatibility">
        <Dialog.Trigger>
          <IconButton
            type="button"
            size="1"
            variant="ghost"
            aria-label="Open STAC URL help"
          >
            <QuestionMarkCircledIcon />
          </IconButton>
        </Dialog.Trigger>
      </Tooltip>

      <Dialog.Content width="min(720px, calc(100vw - 32px))">
        <Dialog.Title>STAC URL compatibility</Dialog.Title>
        <Dialog.Description size="2" color="gray">
          Public STAC metadata can load in the browser while raster rendering still
          fails in TiTiler. These are the main cases we found while testing
          Dionysus.
        </Dialog.Description>

        <Separator size="4" className="stac-help-separator" />

        <ScrollArea className="stac-help-scroll" scrollbars="vertical" type="hover">
          <div className="stac-help-content">
            <Callout.Root color="amber" variant="surface">
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>
              <Callout.Text>
                A STAC item URL has two separate requirements: the browser must be
                allowed to fetch the STAC JSON, and TiTiler must be able to read
                the raster assets referenced inside that JSON.
              </Callout.Text>
            </Callout.Root>

            <Card>
              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <CheckCircledIcon className="stac-help-success" />
                  <Text size="3" weight="bold">
                    Usually works well
                  </Text>
                </Flex>
                <DataList.Root size="2">
                  <DataList.Item>
                    <DataList.Label>Source</DataList.Label>
                    <DataList.Value>Element 84 Earth Search</DataList.Value>
                  </DataList.Item>
                  <DataList.Item>
                    <DataList.Label>Collection</DataList.Label>
                    <DataList.Value>Sentinel-2 L2A</DataList.Value>
                  </DataList.Item>
                  <DataList.Item>
                    <DataList.Label>Why</DataList.Label>
                    <DataList.Value>
                      The STAC API allows browser requests and assets point to
                      public HTTPS Cloud Optimized GeoTIFFs.
                    </DataList.Value>
                  </DataList.Item>
                  <DataList.Item>
                    <DataList.Label>Example</DataList.Label>
                    <DataList.Value>
                      <Text size="1" className="stac-help-url">
                        https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_18TXK_20240908_0_L2A
                      </Text>
                    </DataList.Value>
                  </DataList.Item>
                </DataList.Root>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <CrossCircledIcon className="stac-help-error" />
                  <Text size="3" weight="bold">
                    Browser CORS can block STAC JSON
                  </Text>
                </Flex>
                <DataList.Root size="2">
                  <DataList.Item>
                    <DataList.Label>Example</DataList.Label>
                    <DataList.Value>USGS Landsat STAC</DataList.Value>
                  </DataList.Item>
                  <DataList.Item>
                    <DataList.Label>What happens</DataList.Label>
                    <DataList.Value>
                      The browser blocks Dionysus when the STAC API does not
                      allow the app origin in its CORS response headers.
                    </DataList.Value>
                  </DataList.Item>
                  <DataList.Item>
                    <DataList.Label>Symptom</DataList.Label>
                    <DataList.Value>
                      The item never loads, even before TiTiler starts rendering
                      tiles.
                    </DataList.Value>
                  </DataList.Item>
                </DataList.Root>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <CrossCircledIcon className="stac-help-error" />
                  <Text size="3" weight="bold">
                    TiTiler can be blocked by asset access
                  </Text>
                </Flex>
                <DataList.Root size="2">
                  <DataList.Item>
                    <DataList.Label>Example</DataList.Label>
                    <DataList.Value>Earth Search Landsat C2</DataList.Value>
                  </DataList.Item>
                  <DataList.Item>
                    <DataList.Label>What happens</DataList.Label>
                    <DataList.Value>
                      The STAC JSON loads, but raster assets reference
                      requester-pays S3 paths such as s3://usgs-landsat.
                    </DataList.Value>
                  </DataList.Item>
                  <DataList.Item>
                    <DataList.Label>Symptom</DataList.Label>
                    <DataList.Value>
                      TiTiler tile requests return access denied or similar asset
                      read errors.
                    </DataList.Value>
                  </DataList.Item>
                </DataList.Root>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="3">
                <Flex align="center" gap="2">
                  <InfoCircledIcon className="stac-help-info" />
                  <Text size="3" weight="bold">
                    Signed asset catalogs need extra integration
                  </Text>
                </Flex>
                <DataList.Root size="2">
                  <DataList.Item>
                    <DataList.Label>Example</DataList.Label>
                    <DataList.Value>Microsoft Planetary Computer</DataList.Value>
                  </DataList.Item>
                  <DataList.Item>
                    <DataList.Label>What happens</DataList.Label>
                    <DataList.Value>
                      The STAC API is browser-friendly, but some assets require
                      temporary signed URLs before TiTiler can read them.
                    </DataList.Value>
                  </DataList.Item>
                  <DataList.Item>
                    <DataList.Label>Status</DataList.Label>
                    <DataList.Value>
                      Dionysus does not sign Planetary Computer assets yet.
                    </DataList.Value>
                  </DataList.Item>
                </DataList.Root>
              </Flex>
            </Card>

            <Callout.Root color="blue" variant="surface">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>
                For the hosted app, prefer public HTTPS COG assets. For local
                work, you can point Dionysus to your own TiTiler instance with
                the cloud credentials or signing logic your catalog needs.
              </Callout.Text>
            </Callout.Root>
          </div>
        </ScrollArea>

        <Flex justify="end" mt="4">
          <Dialog.Close>
            <Button type="button" variant="surface">
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
