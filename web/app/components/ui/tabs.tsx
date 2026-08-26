import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import * as s from "./tabs.css"
import { cx } from "~/utils/class-name"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      className={cx(s.root, className)}
      data-orientation={orientation}
      data-slot="tabs"
      {...props}
    />
  )
}

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & { variant?: keyof typeof s.listVariant }) {
  return (
    <TabsPrimitive.List
      className={cx(s.list, s.listVariant[variant], className)}
      data-slot="tabs-list"
      data-variant={variant}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      className={cx(s.trigger, className)}
      data-slot="tabs-trigger"
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      className={cx(s.content, className)}
      data-slot="tabs-content"
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
