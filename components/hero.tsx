'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRight, Download, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface HeroProps {
  name: string
  tagline: string
  avatarUrl?: string
  avatarFallback?: string
  className?: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export function Hero({
  name,
  tagline,
  avatarUrl,
  avatarFallback,
  className
}: HeroProps) {
  const t = useTranslations('home.hero')

  return (
    <section
      className={cn(
        'relative flex min-h-[80vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8',
        className
      )}
      aria-labelledby="hero-heading"
    >
      <motion.div
        className="mx-auto max-w-4xl text-center"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {/* Avatar */}
        <motion.div
          className="mx-auto mb-8 flex justify-center"
          variants={fadeInUp}
        >
          <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-2xl md:h-40 md:w-40">
            <AvatarImage
              src={avatarUrl}
              alt={`${name}'s profile picture`}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary md:text-3xl">
              {avatarFallback || name?.charAt(0)?.toUpperCase() || 'K'}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          id="hero-heading"
          className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          variants={fadeInUp}
        >
          <span className="block">
            {t('title') || `Hi, I'm ${name}`}
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="mb-12 text-lg text-muted-foreground sm:text-xl md:text-2xl"
          variants={fadeInUp}
        >
          {t('subtitle') || tagline}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          variants={fadeInUp}
        >
          <Button
            size="lg"
            className="group h-12 px-8 text-base font-medium"
            asChild
          >
            <a href="#contact" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Get in Touch
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 text-base font-medium"
            asChild
          >
            <a href="/resume" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              View Resume
            </a>
          </Button>
        </motion.div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -right-4 bottom-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div
          className="flex h-8 w-5 justify-center rounded-full border-2 border-muted-foreground/30"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="mt-2 h-1 w-1 rounded-full bg-muted-foreground/50" />
        </motion.div>
        <span className="sr-only">Scroll down to see more content</span>
      </motion.div>
    </section>
  )
}