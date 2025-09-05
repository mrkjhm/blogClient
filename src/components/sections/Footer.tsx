"use client";


import Container from "../ui/Container";

export default function Footer() {
  return (

    <div className="py-5 border-t border-gray-300 text-center">
      <Container>

        <div className="flex justify-between">

          <p>@ 2025 Blog. All rights reserved.</p>

          <button
            className="h-10 w-10 bg-gray-300 rounded-full"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <i className="ri-arrow-up-line"></i>
          </button>

        </div>
      </Container>
    </div>

  )
}
