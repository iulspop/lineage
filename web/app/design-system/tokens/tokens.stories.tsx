import type { Meta, StoryObj } from "@storybook/react-vite"

import { colorToken, darkColorPalette, lightColorPalette } from "./colors.css"
import { duration, easing } from "./motion.css"
import { radius } from "./radii.css"
import { shadow } from "./shadows.css"
import { layout, space } from "./spacing.css"
import * as s from "./tokens.stories.css"
import { fontFamily, fontSize, fontWeight, lineHeight } from "./typography.css"
import { zIndex } from "./z-index.css"

type TokenMap = Record<string, string>

const meta = {
  title: "Design System/Tokens",
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const flattenTokens = (tokens: unknown, prefix = ""): TokenMap =>
  Object.fromEntries(
    Object.entries(tokens as Record<string, unknown>).flatMap(
      ([name, value]) =>
        typeof value === "string"
          ? [[`${prefix}${name}`, value]]
          : Object.entries(flattenTokens(value, `${prefix}${name}.`)),
    ),
  )

const TokenPage = ({
  children,
  description,
  title,
}: {
  children: React.ReactNode
  description: string
  title: string
}) => (
  <div className={s.page}>
    <header className={s.hero}>
      <span className={s.eyebrow}>Design tokens</span>
      <h1 className={s.heroTitle}>{title}</h1>
      <p className={s.heroDescription}>{description}</p>
    </header>
    {children}
  </div>
)

const TokenSection = ({
  children,
  description,
  title,
}: {
  children: React.ReactNode
  description: string
  title: string
}) => (
  <section className={s.section}>
    <div className={s.sectionHeader}>
      <h2 className={s.title}>{title}</h2>
      <p className={s.description}>{description}</p>
    </div>
    {children}
  </section>
)

const Swatches = ({ tokens }: { tokens: TokenMap }) => (
  <div className={s.grid}>
    {Object.entries(tokens).map(([name, value]) => (
      <div className={s.swatch} key={name}>
        <div className={s.swatchColor} style={{ background: value }} />
        <div className={s.swatchBody}>
          <span className={s.name}>{name}</span>
          <span className={s.value}>{value}</span>
        </div>
      </div>
    ))}
  </div>
)

const TokenCards = ({
  renderPreview = (value) => value,
  tokens,
}: {
  renderPreview?: (value: string) => React.ReactNode
  tokens: TokenMap
}) => (
  <div className={s.grid}>
    {Object.entries(tokens).map(([name, value]) => (
      <div className={s.tokenCard} key={name}>
        <span className={s.name}>{name}</span>
        <span className={s.value}>{value}</span>
        <div className={s.tokenPreview}>{renderPreview(value)}</div>
      </div>
    ))}
  </div>
)

const TypeSpecimen = ({
  name,
  sample,
  style,
  value,
}: {
  name: string
  sample: string
  style: React.CSSProperties
  value: string
}) => (
  <div className={s.typeSpecimen}>
    <p className={s.typeSpecimenText} style={style}>
      {sample}
    </p>
    <div className={s.typeMeta}>
      <span className={s.name}>{name}</span>
      <span className={s.pill}>{value}</span>
    </div>
  </div>
)

export const Colors: Story = {
  render: () => (
    <TokenPage
      description="A two-layer color system: raw color tokens hold hex values, while semantic palettes map UI roles to those tokens. Components only consume the palette contract through theme.color."
      title="Color system"
    >
      <TokenSection
        description="Raw color tokens map stable names to hex values. They are source material for palettes, not direct application styling hooks."
        title="Color tokens"
      >
        <Swatches tokens={colorToken} />
      </TokenSection>

      <TokenSection
        description="The light palette assigns semantic roles to raw tokens. This contract is what application styles consume."
        title="Light semantic palette"
      >
        <Swatches tokens={flattenTokens(lightColorPalette)} />
      </TokenSection>

      <TokenSection
        description="The dark palette implements the same contract with different token assignments, which keeps light/dark mode isolated from component code."
        title="Dark semantic palette"
      >
        <Swatches tokens={flattenTokens(darkColorPalette)} />
      </TokenSection>
    </TokenPage>
  ),
}

export const Spacing: Story = {
  render: () => (
    <TokenPage
      description="Spacing tokens create rhythm. The primitive scale handles component spacing, while layout tokens name reusable page dimensions."
      title="Spacing and layout"
    >
      <TokenSection
        description="Use these values for gaps, padding, page width, and repeatable layout decisions."
        title="Scale"
      >
        <TokenCards
          renderPreview={(value) => (
            <div
              style={{
                background: "currentColor",
                borderRadius: "999px",
                height: "0.75rem",
                width: value,
              }}
            />
          )}
          tokens={{ ...space, ...flattenTokens({ layout }) }}
        />
      </TokenSection>
    </TokenPage>
  ),
}

export const Typography: Story = {
  render: () => (
    <TokenPage
      description="Typography tokens define the voice of the template: family, size, weight, and line-height decisions are visible as real type specimens."
      title="Typography"
    >
      <div className={s.typographyStack}>
        <TokenSection
          description="Font families define the broad character of interface and code text."
          title="Font families"
        >
          <TypeSpecimen
            name="family.sans"
            sample="Design the interface around clear, quiet confidence."
            style={{ fontFamily: fontFamily.sans, fontSize: fontSize.xl }}
            value={fontFamily.sans}
          />
          <TypeSpecimen
            name="family.mono"
            sample="const palette = lightColorPalette"
            style={{ fontFamily: fontFamily.mono, fontSize: fontSize.base }}
            value={fontFamily.mono}
          />
        </TokenSection>

        <TokenSection
          description="The type scale shows hierarchy from captions to display-sized headings."
          title="Type scale"
        >
          <div className={s.typographyStack}>
            {Object.entries(fontSize).map(([name, value]) => (
              <TypeSpecimen
                key={name}
                name={`size.${name}`}
                sample="Build calm, useful software."
                style={{ fontSize: value, fontWeight: fontWeight.semibold }}
                value={value}
              />
            ))}
          </div>
        </TokenSection>

        <TokenSection
          description="Weights control emphasis without inventing one-off styles."
          title="Font weights"
        >
          <div className={s.typographyStack}>
            {Object.entries(fontWeight).map(([name, value]) => (
              <TypeSpecimen
                key={name}
                name={`weight.${name}`}
                sample="Useful defaults, thoughtful details."
                style={{ fontSize: fontSize.xl, fontWeight: value }}
                value={value}
              />
            ))}
          </div>
        </TokenSection>

        <TokenSection
          description="Line heights tune density and reading comfort across interface text."
          title="Line heights"
        >
          <div className={s.typographyStack}>
            {Object.entries(lineHeight).map(([name, value]) => (
              <TypeSpecimen
                key={name}
                name={`lineHeight.${name}`}
                sample="A good template should feel complete before a product team customizes it."
                style={{ fontSize: fontSize.lg, lineHeight: value }}
                value={value}
              />
            ))}
          </div>
        </TokenSection>
      </div>
    </TokenPage>
  ),
}

export const ShapeShadowMotionAndLayering: Story = {
  render: () => (
    <TokenPage
      description="These supporting tokens keep shape, elevation, animation, and layering consistent across the template."
      title="Shape, shadow, motion, and layering"
    >
      <TokenSection
        description="Use these tokens instead of one-off border radii, shadows, timings, easing curves, and z-index values."
        title="Supporting tokens"
      >
        <TokenCards
          tokens={{
            ...flattenTokens({ duration }),
            ...flattenTokens({ easing }),
            ...flattenTokens({ radius }),
            ...flattenTokens({ shadow }),
            ...flattenTokens({ zIndex }),
          }}
        />
      </TokenSection>
    </TokenPage>
  ),
}
