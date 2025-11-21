export async function GET(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const { searchParams } = new URL(request.url);
      const itemType = searchParams.get("type");
  
      const where: any = { userId: session.user.id };
      if (itemType) where.itemType = itemType;
  
      const savedItems = await prisma.savedItem.findMany({
        where,
        orderBy: { savedAt: "desc" },
      });
  
      return NextResponse.json(savedItems);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch saved items" },
        { status: 500 }
      );
    }
  }
  
  // POST /api/saved-items - Save an item
  export async function POST(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const body = await request.json();
      const { itemType, itemId, notes } = body;
  
      const savedItem = await prisma.savedItem.create({
        data: {
          userId: session.user.id,
          itemType,
          itemId,
          notes,
        },
      });
  
      return NextResponse.json(savedItem, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to save item" },
        { status: 500 }
      );
    }
  }
  