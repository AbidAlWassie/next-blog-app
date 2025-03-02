import { auth } from "@/app/(auth)/auth";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CreatePostButton from "./CreatePostBtn";
import { EditDeleteButtons } from "./EditDeleteBtn";
import { EditSiteForm } from "./EditSiteForm";

interface Site {
  id: string;
  name: string;
  subdomain: string;
  description?: string;
}

export default async function SitePage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const site = await prisma.site.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      posts: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!site) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{site.name}</h1>
          <p className="mt-1">
            <Link
              href={`${process.env.PROTOCOL}${site.subdomain}.${process.env.BASE_DOMAIN}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {site.subdomain}.{process.env.BASE_DOMAIN}
            </Link>
          </p>
        </div>
        <div className="flex space-x-4">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <CreatePostButton siteId={site.id} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Edit Site</h2>
        <EditSiteForm site={site as Site} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>

        {site.posts.length === 0 ? (
          <div className="text-center py-12 rounded-lg">
            <h3 className="text-lg font-medium">No posts yet</h3>
            <p className="mt-2">Get started by creating your first post.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {site.posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{post.title}</h3>
                    <p className="mt-1">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <EditDeleteButtons postId={post.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
