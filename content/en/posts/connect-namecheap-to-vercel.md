---
title: How To Connect You Namecheap Domain With Vercel Deployed App
date: 2023/5/1
description: Here you will lean how to connect your namecheap domain to vercel deployed app.
image: /blog-images/connect-namecheap-to-vercel.jpg
alt: How To Connect You Namecheap Domain With Vercel Deployed App
ogImage: /blog-images/connect-namecheap-to-vercel.jpg
tags: ['namecheap', 'vercel', 'custom domain', 'dns', 'deployment', 'web hosting']
categories: ['Web Development', 'Domain Management', 'Deployment Guides']
published: true
schemaOrg:
  - "@type": "BlogPosting"
    headline: "How To Connect You Namecheap Domain With Vercel Deployed App"
    description: "Here you will lean how to connect your namecheap domain to vercel deployed app."
    author:
      "@type": "Person"
      name: "BarZ Hsieh"
    datePublished: "2023/5/1"
    dateModified: "2023/5/1"
    image: "https://barz.app/blog-images/connect-namecheap-to-vercel.jpg"
    keywords: ["Namecheap", "Domain", "Vercel", "Deploy"]
    articleSection: "TechArticle"
sitemap:
  lastmod: 2025-04-17
  changefreq: weekly
  priority: 0.8
  images:
    - loc: /blog-images/connect-namecheap-to-vercel.jpg
      title: "How To Connect You Namecheap Domain With Vercel Deployed App"
      caption: "How To Connect You Namecheap Domain With Vercel Deployed App"
---

## Introduction

If you've purchased a domain from Namecheap and you want to connect it to your Vercel app, there are a few steps you need to follow. In this blog, we'll guide you through the process of connecting your Namecheap domain with your Vercel app.

## Step 1: Add a custom domain to your Vercel app

The first step is to add your custom domain to your Vercel app. To do this, log in to your Vercel account and go to your app dashboard. Click on "Settings" and then "Domains". Click on "Add Domain" and enter your custom domain name. Then click on "Add".

## Step 2: Get the DNS records from Vercel

Once you've added your custom domain to your Vercel app, you'll need to get the DNS records from Vercel. To do this, go back to the "Domains" section and click on the custom domain you just added. Then click on "DNS Records".

You'll see a list of DNS records that you need to add to your Namecheap account. These include the A record, the CNAME record, and the TXT record.

## Step 3: Add DNS records to Namecheap

Now that you have the DNS records from Vercel, you need to add them to your Namecheap account. To do this, log in to your Namecheap account and go to your domain dashboard. Click on "Advanced DNS" and then "Add New Record".

Add the A record first. In the "Type" dropdown menu, select "A (Address)". In the "Host" field, enter "@" (without the quotes). In the "Value" field, enter the IP address from the Vercel DNS records.

Next, add the CNAME record. In the "Type" dropdown menu, select "CNAME (Alias)". In the "Host" field, enter "www" (without the quotes). In the "Value" field, enter the value from the Vercel DNS records.

Finally, add the TXT record. In the "Type" dropdown menu, select "TXT (Text)". In the "Host" field, enter "@" (without the quotes). In the "Value" field, enter the value from the Vercel DNS records.

## Step 4: Verify DNS records

Once you've added the DNS records to your Namecheap account, you need to verify that they're correct. To do this, go back to your Vercel app dashboard and click on the custom domain. Then click on "Verify DNS Configuration". Vercel will check if the DNS records have been set up correctly.

It may take some time for the DNS records to propagate, so be patient. Once the DNS records have propagated, Vercel will verify them and your custom domain will be connected to your Vercel app.

## Conclusion

Connecting your Namecheap domain to your Vercel app is a relatively simple process. By following the steps outlined in this blog, you'll be able to connect your custom domain in no time. Remember to be patient as it may take some time for the DNS records to propagate. If you run into any issues, don't hesitate to reach out to Vercel support for assistance.
