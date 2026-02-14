"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"

export default function Home() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!session) {
    return (
      <div style={{ maxWidth: "400px", margin: "100px auto" }}>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}   // Only Email login
        />
      </div>
    )
  }

  return <BookmarkApp user={session.user} />
}

function BookmarkApp({ user }: any) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [bookmarks, setBookmarks] = useState<any[]>([])

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setBookmarks(data || [])
  }

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const addBookmark = async () => {
    if (!title || !url) return alert("Fill all fields")

    await supabase.from("bookmarks").insert([
      { title, url, user_id: user.id }
    ])

    setTitle("")
    setUrl("")
    fetchBookmarks()
  }

  const deleteBookmark = async (id: string) => {
    await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)

    fetchBookmarks()
  }

  return (
    <div style={{
      maxWidth: "600px",
      margin: "50px auto",
      fontFamily: "Arial"
    }}>
      <h1 style={{ textAlign: "center" }}>
        Smart Bookmark App 🚀
      </h1>

      <p style={{ textAlign: "center" }}>
        Logged in as: {user.email}
      </p>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            background: "black",
            color: "white",
            padding: "8px 12px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      <div style={{
        background: "#f4f4f4",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px"
      }}>
        <input
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <button
          onClick={addBookmark}
          style={{
            width: "100%",
            padding: "10px",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Add Bookmark
        </button>
      </div>

      <h2>My Bookmarks</h2>

      {bookmarks.map((item) => (
        <div
          key={item.id}
          style={{
            background: "white",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "15px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <h3>{item.title}</h3>
          <a href={item.url} target="_blank">
            {item.url}
          </a>

          <br /><br />

          <button
            onClick={() => deleteBookmark(item.id)}
            style={{
              background: "red",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Delete ❌
          </button>
        </div>
      ))}
    </div>
  )
}
