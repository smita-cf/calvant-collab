import dynamic from 'next/dynamic';
import { getPageMetadata } from '@/utils/getPageMetadata';

export async function generateMetadata() {
  return getPageMetadata('/blog', {
    title: 'Compliance & Security Blog | CalVant',
    description: 'Latest insights on compliance, security and data privacy from CalVant.',
    alternates: { canonical: 'https://calvant.com/blog' },
  });
}

const BlogPage = dynamic(() => import('@/static-pages/blog'), { ssr: false });

const seoStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
};

export default function Page() {
  return (
    <>
      <div style={seoStyle}>
        <h1>Compliance &amp; Security Blog | CalVant</h1>
        <p>
          Stay ahead with expert insights on ISO 27001, ISO 27701, ISO 42001,
          SOC 2, GDPR, KSA PDPL and enterprise risk management from the CalVant
          team. Our blog covers compliance strategy, information security best
          practices, data privacy frameworks, AI governance, and continuous
          control monitoring for mid-market and enterprise organizations.
        </p>
        <h2>Topics We Cover</h2>
        <ul>
          <li>ISO 27001 implementation and certification guidance</li>
          <li>GDPR and data privacy compliance strategies</li>
          <li>SOC 2 audit preparation and evidence collection</li>
          <li>AI governance and ISO 42001 framework</li>
          <li>Risk assessment methodologies and best practices</li>
          <li>Gap assessment and control mapping techniques</li>
          <li>Third-party risk management and vendor due diligence</li>
          <li>Continuous compliance monitoring and automation</li>
        </ul>
        <h2>Why Read the CalVant Blog</h2>
        <p>
          The CalVant blog is written for compliance managers, CISOs, risk officers,
          and security professionals who need actionable guidance — not just theory.
          Every article is grounded in real implementation experience across ISO 27001,
          ISO 27701, ISO 42001, SOC 2, GDPR, KSA PDPL and other global frameworks.
        </p>
        <h2>Latest Compliance Insights</h2>
        <p>
          From building your first Information Security Management System to achieving
          certification, our articles walk you through each step with practical advice.
          We cover risk register setup, gap assessment techniques, audit evidence
          collection, policy documentation, statement of applicability, and how to
          present compliance posture to your board and customers.
        </p>
        <h2>Data Privacy and AI Governance</h2>
        <p>
          Privacy regulations are evolving rapidly. Our blog tracks developments in
          GDPR enforcement, KSA PDPL implementation, and the rise of AI governance
          under ISO 42001. We help you understand how to extend your existing ISMS into
          a Privacy Information Management System under ISO 27701, and how to prepare
          for AI-specific risk assessments and controls.
        </p>
        <h2>Continuous Compliance for Growing Organizations</h2>
        <p>
          Whether you are a startup pursuing your first ISO 27001 certification or an
          enterprise managing multiple frameworks simultaneously, CalVant provides the
          tools and knowledge to keep your compliance program running continuously.
          Our platform automates evidence collection, control mapping, and audit
          readiness so your team can focus on business priorities.
        </p>
      </div>
      <BlogPage />
    </>
  );
}