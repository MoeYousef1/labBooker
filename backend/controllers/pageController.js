const Page = require('../models/Pages');

exports.getPage = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug })
      .populate('lastUpdatedBy', 'name email role');

    if (!page) {
      return res.status(200).json({ 
        exists: false,
        message: 'No content available'
      });
    }

    res.json({
      exists: true,
      slug: page.slug,
      title: page.title,
      content: page.content,
      lastUpdated: page.updatedAt,
      lastUpdatedBy: page.lastUpdatedBy
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const existingPage = await Page.findOne({ slug: req.params.slug });
    const updateData = {
      title: title || existingPage?.title || 'Privacy Policy',
      content: content || existingPage?.content || '',
      lastUpdatedBy: req.user._id
    };

    const page = await Page.findOneAndUpdate(
      { slug: req.params.slug },
      updateData,
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    ).populate('lastUpdatedBy', 'name email role');

    res.json({
      message: 'Page updated successfully',
      page: {
        slug: page.slug,
        title: page.title,
        content: page.content,
        lastUpdated: page.updatedAt,
        lastUpdatedBy: page.lastUpdatedBy
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Update failed',
      error: error.message 
    });
  }
};