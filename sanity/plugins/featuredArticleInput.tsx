'use client'

import { useCallback, useState, useEffect } from 'react'
import { BooleanInputProps, set, unset, useClient, useFormValue } from 'sanity'
import { Card, Stack, Text, Button, Dialog, Flex, Checkbox, Box } from '@sanity/ui'

interface FeaturedArticle {
  _id: string
  title: string
  language: string
  publishedAt?: string
}

export function FeaturedArticleInput(props: BooleanInputProps) {
  const { value, onChange, elementProps } = props
  const client = useClient({ apiVersion: '2024-05-02' })
  
  const currentDocId = useFormValue(['_id']) as string | undefined
  const currentLanguage = useFormValue(['language']) as string | undefined
  const currentTitle = useFormValue(['title']) as string | undefined
  
  const [isChecking, setIsChecking] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [existingFeatured, setExistingFeatured] = useState<FeaturedArticle[]>([])
  const [selectedToReplace, setSelectedToReplace] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cleanDocId = currentDocId?.replace(/^drafts\./, '')

  const checkExistingFeatured = useCallback(async () => {
    if (!cleanDocId || !currentLanguage) return []

    setIsChecking(true)
    setError(null)

    try {
      const query = `*[_type == "blogPost" && isFeatured == true && language == $language && _id != $currentId && !(_id in path("drafts.**"))] | order(publishedAt desc) {
        _id,
        title,
        language,
        publishedAt
      }`
      
      const result = await client.fetch<FeaturedArticle[]>(query, {
        language: currentLanguage,
        currentId: cleanDocId,
      })

      return result || []
    } catch (err) {
      console.error('Error checking existing featured articles:', err)
      setError('Failed to check existing featured articles')
      return []
    } finally {
      setIsChecking(false)
    }
  }, [client, cleanDocId, currentLanguage])

  const handleToggle = useCallback(async () => {
    if (value) {
      onChange(unset())
      return
    }

    const existing = await checkExistingFeatured()
    
    if (existing.length >= 4) {
      setExistingFeatured(existing)
      setSelectedToReplace(existing[0]._id)
      setShowDialog(true)
    } else {
      onChange(set(true))
    }
  }, [value, onChange, checkExistingFeatured])

  const handleConfirmReplace = useCallback(async () => {
    if (existingFeatured.length === 0 || !selectedToReplace || !cleanDocId) return

    setIsUpdating(true)
    setError(null)

    try {
      const existingCleanId = selectedToReplace.replace(/^drafts\./, '')
      
      await client
        .transaction()
        .patch(existingCleanId, (patch) => patch.set({ isFeatured: false }))
        .patch(`drafts.${existingCleanId}`, (patch) => patch.set({ isFeatured: false }))
        .commit({ autoGenerateArrayKeys: true })

      onChange(set(true))
      setShowDialog(false)
      setExistingFeatured([])
      setSelectedToReplace(null)
    } catch (err) {
      console.error('Error replacing featured article:', err)
      setError('Failed to replace featured article. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }, [client, existingFeatured, selectedToReplace, cleanDocId, onChange])

  const handleCancelReplace = useCallback(() => {
    setShowDialog(false)
    setExistingFeatured([])
    setSelectedToReplace(null)
    setError(null)
  }, [])

  return (
    <>
      <Stack space={3}>
        <Stack space={2}>
          <Text weight="semibold" size={1}>Featured Article</Text>
          <Text size={1} muted>
            Mark this article as featured. Up to 4 articles can be featured at a time, displayed in order from newest to oldest.
          </Text>
        </Stack>

        <Checkbox
          {...elementProps}
          checked={value || false}
          onChange={handleToggle}
          disabled={isChecking || isUpdating}
        />

        {value && (
          <Card padding={3} radius={2} tone="positive">
            <Text size={1} weight="medium">
              ✓ This article is currently featured
            </Text>
          </Card>
        )}

        {error && (
          <Card padding={3} radius={2} tone="critical">
            <Text size={1}>{error}</Text>
          </Card>
        )}
      </Stack>

      {showDialog && existingFeatured.length > 0 && (
        <Dialog
          header="Maximum Featured Articles Reached"
          id="featured-article-dialog"
          onClose={handleCancelReplace}
          width={1}
        >
          <Stack space={4} padding={4}>
            <Text>
              You already have <strong>4 featured articles</strong> (the maximum allowed).
            </Text>
            <Text>
              To feature <strong>"{currentTitle || 'this article'}"</strong>, please select which article to replace:
            </Text>

            <Stack space={3}>
              {existingFeatured.map((article) => (
                <Card
                  key={article._id}
                  padding={3}
                  radius={2}
                  tone={selectedToReplace === article._id ? 'primary' : 'default'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedToReplace(article._id)}
                >
                  <Flex align="center" gap={3}>
                    <Checkbox
                      checked={selectedToReplace === article._id}
                      readOnly
                    />
                    <Stack space={2} flex={1}>
                      <Text weight="medium">{article.title}</Text>
                      {article.publishedAt && (
                        <Text size={1} muted>
                          {new Date(article.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      )}
                    </Stack>
                  </Flex>
                </Card>
              ))}
            </Stack>

            {error && (
              <Card padding={3} radius={2} tone="critical">
                <Text size={1}>{error}</Text>
              </Card>
            )}

            <Flex gap={3} justify="flex-end">
              <Button
                text="Cancel"
                mode="ghost"
                onClick={handleCancelReplace}
                disabled={isUpdating}
              />
              <Button
                text={isUpdating ? 'Replacing...' : 'Replace Selected'}
                tone="primary"
                onClick={handleConfirmReplace}
                disabled={isUpdating || !selectedToReplace}
                loading={isUpdating}
              />
            </Flex>
          </Stack>
        </Dialog>
      )}
    </>
  )
}
