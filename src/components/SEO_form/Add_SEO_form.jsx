import React, { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'

function Add_SEO_form () {
  const [url, setURL] = useState('')
  const [pageTitle, setpageTitle] = useState('')
  const [metaKeywords, setmetaKeywords] = useState('')
  const [metaDesc, setmetaDesc] = useState('')

  // Advanced SEO Fields (Serialized into metaKeywords)
  const [ogImage, setOgImage] = useState('')
  const [robots, setRobots] = useState('index, follow')
  const [canonical, setCanonical] = useState('')

  const sendData = e => {
    e.preventDefault()

    // ── ADVANCED SEO SERIALIZATION ────────────────────────────────
    // We store extra metadata in the metaKeywords field using a JSON bridge
    const advancedMetadata = {
      og_img: ogImage.trim(),
      robots: robots.trim(),
      canonical: canonical.trim()
    }

    // Only append if there's meaningful advanced data
    const finalKeywords = ogImage || canonical || robots !== 'index, follow'
      ? `${metaKeywords} | ${JSON.stringify(advancedMetadata)}`
      : metaKeywords

    axios
      .post(`https://api.calvant.com/seo-form/api/seo`, {
        url,
        pageTitle,
        metaKeywords: finalKeywords,
        metaDesc
      })
      .then(e => {
        alert('SEO form added successfully')
        window.location.pathname = '/seo_form/list'
      })
      .catch(err => {
        console.error('Error adding SEO:', err)
        alert('Failed to add SEO form')
      })
  }

  return (
    <div className='main_div'>
      <h2> ADD SEO FORM </h2>
      <form onSubmit={sendData}>
        {/* Core Fields */}
        <div className='divqs'>
          <label htmlFor='url'> URL : </label>
          <input
            type='text'
            id='url'
            placeholder='/example-path'
            name='url'
            value={url}
            onChange={e => setURL(e.target.value)}
          />
        </div>
        <div className='divqs'>
          <label htmlFor='pageTitle'> Page Title : </label>
          <input
            type='text'
            id='pageTitle'
            name='pageTitle'
            placeholder='Page SEO Title'
            value={pageTitle}
            onChange={e => setpageTitle(e.target.value)}
          />
        </div>
        <div className='divqs'>
          <label htmlFor='keywords'> Meta Keywords : </label>
          <input
            type='text'
            id='keywords'
            name='metaKeywords'
            placeholder='keyword1, keyword2'
            value={metaKeywords}
            onChange={e => setmetaKeywords(e.target.value)}
          />
        </div>
        <div className='divqs'>
          <label htmlFor='desc'> Meta Description : </label>
          <textarea
            id='desc'
            name='metaDesc'
            placeholder='Page description for search results'
            value={metaDesc}
            style={{ width: '100%', minHeight: '80px', padding: '8px', marginTop: '5px' }}
            onChange={e => setmetaDesc(e.target.value)}
          />
        </div>

        {/* ── ADVANCED SEO SECTION ────────────────────────────── */}
        <div style={{ marginTop: '30px', padding: '15px', border: '1px dashed #ccc', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1rem', marginTop: 0 }}>Advanced SEO (OG & Metadata)</h3>
          <p style={{ fontSize: '0.8rem', color: '#666' }}>These fields are encoded into the keywords field automatically.</p>

          <div className='divqs'>
            <label htmlFor='ogImage'> OG Image URL : </label>
            <input
              type='text'
              id='ogImage'
              placeholder='https://example.com/image.jpg'
              value={ogImage}
              onChange={e => setOgImage(e.target.value)}
            />
          </div>

          <div className='divqs'>
            <label htmlFor='robots'> Robots Directive : </label>
            <select
              id='robots'
              value={robots}
              onChange={e => setRobots(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value='index, follow'>index, follow (Default)</option>
              <option value='noindex, nofollow'>noindex, nofollow</option>
              <option value='noindex, follow'>noindex, follow</option>
              <option value='index, nofollow'>index, nofollow</option>
            </select>
          </div>

          <div className='divqs'>
            <label htmlFor='canonical'> Canonical Override : </label>
            <input
              type='text'
              id='canonical'
              placeholder='https://calvant.com/canonical-url'
              value={canonical}
              onChange={e => setCanonical(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: '50px' }}>
          <Button
            type="submit"
            variant='contained'
            color='primary'
          >
            Submit SEO
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

export default Add_SEO_form
