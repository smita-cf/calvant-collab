import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import Button from '@mui/material/Button'

const API_URL = 'https://api.calvant.com/seo-form/api/seo'

function Edit_SEO_form() {
  const { id } = useParams()

  // Primary Fields
  const [url, setURL] = useState('')
  const [pageTitle, setPageTitle] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')
  const [metaDesc, setMetaDesc] = useState('')

  // Advanced SEO Fields (Serialized into metaKeywords)
  const [ogImage, setOgImage] = useState('')
  const [robots, setRobots] = useState('index, follow')
  const [canonical, setCanonical] = useState('')

  // Fetch data when component loads
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/${id}`)
      const data = res.data

      // Core Parsing
      setURL(data.url || '')
      setPageTitle(data.pageTitle || '')
      setMetaDesc(data.metaDesc || '')

      // ── ADVANCED SEO DECODING ──────────────────────────────
      const rawKeywords = data.metaKeywords || ''
      if (rawKeywords.includes(' | {')) {
        const [keywordsOnly, jsonPart] = rawKeywords.split(' | ')
        setMetaKeywords(keywordsOnly)
        try {
          const extra = JSON.parse(jsonPart)
          setOgImage(extra.og_img || '')
          setRobots(extra.robots || 'index, follow')
          setCanonical(extra.canonical || '')
        } catch (e) {
          console.error('[SEO-DECODE-ERROR]: Error parsing JSON part of keywords')
          setMetaKeywords(rawKeywords) // Fallback if parsing fails
        }
      } else {
        setMetaKeywords(rawKeywords)
      }

    } catch (err) {
      console.error('Fetch Error:', err)
      alert('Failed to fetch SEO record')
    }
  }

  const sendData = (e) => {
    e.preventDefault()

    // ── ADVANCED SEO SERIALIZATION ──────────────────────────────
    const advancedMetadata = {
      og_img: ogImage.trim(),
      robots: robots.trim(),
      canonical: canonical.trim()
    }

    // Only append if there's advanced data
    const finalKeywords = ogImage || canonical || robots !== 'index, follow'
      ? `${metaKeywords} | ${JSON.stringify(advancedMetadata)}`
      : metaKeywords

    axios
      .post(API_URL, {
        id, // Include the ID to ensure it's an update
        url,
        pageTitle,
        metaKeywords: finalKeywords,
        metaDesc
      })
      .then(res => {
        alert('SEO updated successfully')
        window.location.pathname = '/seo_form/list'
      })
      .catch(err => {
        console.error('Update Error:', err)
        alert('Failed to update SEO record')
      })
  }

  return (
    <div className='main_div'>
      <h2>Edit SEO</h2>
      <form onSubmit={sendData}>
        {/* Core Fields */}
        <div className='divqs'>
          <label htmlFor='url'>URL :</label>
          <input
            type="text"
            id='url'
            value={url}
            onChange={(e) => setURL(e.target.value)}
          />
        </div>

        <div className='divqs'>
          <label htmlFor='pageTitle'>Page Title :</label>
          <input
            type="text"
            id='pageTitle'
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
          />
        </div>

        <div className='divqs'>
          <label htmlFor='keywords'>Meta Keywords :</label>
          <input
            type="text"
            id='keywords'
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
          />
        </div>

        <div className='divqs'>
          <label htmlFor='desc'>Meta Description :</label>
          <textarea
            id='desc'
            value={metaDesc}
            style={{ width: '100%', minHeight: '80px', padding: '8px', marginTop: '5px' }}
            onChange={(e) => setMetaDesc(e.target.value)}
          />
        </div>

        {/* ── ADVANCED SEO SECTION ────────────────────────────── */}
        <div style={{ marginTop: '30px', padding: '15px', border: '1px dashed #ccc', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1rem', marginTop: 0 }}>Advanced SEO (OG & Metadata)</h3>
          <p style={{ fontSize: '0.8rem', color: '#666' }}>These are encoded in the keywords field.</p>

          <div className='divqs'>
            <label htmlFor='ogImage'>OG Image URL :</label>
            <input
              type="text"
              id='ogImage'
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
            />
          </div>

          <div className='divqs'>
            <label htmlFor='robots'>Robots Directive :</label>
            <select
              id='robots'
              value={robots}
              onChange={(e) => setRobots(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value='index, follow'>index, follow (Default)</option>
              <option value='noindex, nofollow'>noindex, nofollow</option>
              <option value='noindex, follow'>noindex, follow</option>
              <option value='index, nofollow'>index, nofollow</option>
            </select>
          </div>

          <div className='divqs'>
            <label htmlFor='canonical'>Canonical Override :</label>
            <input
              type="text"
              id='canonical'
              value={canonical}
              onChange={(e) => setCanonical(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: '50px' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>

          <Link to='/seo_form/list'>
            <Button
              style={{ marginLeft: '20px' }}
              variant='outlined'
              color='inherit'
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Edit_SEO_form
